import { useEffect, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { HelpCircle } from 'lucide-react';
import { useForm, type FieldError, type UseFormRegisterReturn } from 'react-hook-form';
import { z } from 'zod';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { ApprovalStatusBadge } from '@/components/common/ApprovalStatusBadge';
import { Card } from '@/components/common/Card';
import { LoadingState } from '@/components/common/LoadingState';
import { PageHeader } from '@/components/common/PageHeader';
import { shopApplicationService } from '@/services/shopApplicationService';
import { useAuthStore } from '@/store/authStore';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PROOF_TYPES = [...IMAGE_TYPES, 'application/pdf'];

const requiredFile = (types: string[], typeMessage: string) => z
  .custom<File>((value) => value instanceof File, 'Please choose a file')
  .refine((file) => file.size <= MAX_FILE_SIZE, 'File must be 5MB or smaller')
  .refine((file) => types.includes(file.type), typeMessage);

const applicationFormSchema = z.object({
  shopName: z.string().trim().min(2, 'Shop / business name is required').max(100),
  girlEmma: z.string().trim().max(100).optional(),
  businessDescription: z.string().trim().min(20, 'Description must be at least 20 characters').max(2000),
  businessPhone: z.string().trim().min(1, 'Business phone is required').regex(/^\+?[0-9][0-9\s().-]{4,28}$/, 'Enter a valid phone number'),
  shopAddress: z.string().trim().min(5, 'Business address is required').max(500),
  cityTownship: z.string().trim().min(2, 'City / township is required').max(100),
  businessRegistrationNumber: z.string().trim().max(100).optional(),
  shopLogo: requiredFile(IMAGE_TYPES, 'Logo must be a JPG, PNG, or WebP image'),
  businessCategory: z.enum(['Retail', 'Wholesale', 'Food & Beverage', 'Services', 'Technology', 'Manufacturing', 'Other'], { required_error: 'Business category is required' }),
  businessEmail: z.union([z.literal(''), z.string().trim().email('Enter a valid email address').max(255)]).optional(),
  ownerRole: z.string().trim().min(2, 'Owner role is required').max(100),
  websiteUrl: z.union([z.literal(''), z.string().trim().url('Enter a valid URL, including https://').max(500)]).optional(),
  verificationDocument: requiredFile(PROOF_TYPES, 'Proof must be a PDF, JPG, PNG, or WebP file'),
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

function FieldLabel({ children, required, tooltip }: { children: ReactNode; required?: boolean; tooltip?: string }) {
  return <span className="group relative mb-1.5 inline-flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
    {children}{required && <span className="text-red-600" aria-hidden="true">*</span>}
    {tooltip && <span className="relative inline-flex" tabIndex={0} aria-label={tooltip}>
      <HelpCircle className="h-4 w-4 cursor-help text-slate-400" aria-hidden="true" />
      <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-normal leading-5 text-white shadow-lg group-hover:block group-focus-within:block">
        {tooltip}
      </span>
    </span>}
  </span>;
}

function FieldErrorMessage({ error }: { error?: FieldError }) {
  return error ? <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">{error.message}</p> : null;
}

function FileField({ id, label, tooltip, accept, file, error, onChange }: { id: string; label: string; tooltip: string; accept: string; file?: File; error?: FieldError; onChange: (file?: File) => void }) {
  return <div>
    <FieldLabel required tooltip={tooltip}>{label}</FieldLabel>
    <label htmlFor={id} className={`flex min-h-11 cursor-pointer items-center overflow-hidden rounded-xl border bg-white text-sm shadow-sm transition dark:bg-slate-900 ${error ? 'border-red-500 ring-1 ring-red-200' : 'border-slate-200 hover:border-violet-300 dark:border-slate-700'}`}>
      <span className="self-stretch bg-violet-50 px-4 py-3 font-semibold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">Choose File</span>
      <span className="min-w-0 flex-1 truncate px-3 text-slate-500">{file?.name ?? 'No file chosen'}</span>
      <input id={id} className="sr-only" type="file" accept={accept} onChange={(event) => onChange(event.target.files?.[0])} />
    </label>
    <FieldErrorMessage error={error} />
  </div>;
}

const fieldClass = (error?: FieldError) => `control ${error ? '!border-red-500 focus:!border-red-500 focus:!ring-red-100' : ''}`;

function applicationError(error: unknown) {
  if (axios.isAxiosError<{ error?: string; details?: Record<string, string[] | undefined> }>(error)) {
    const details = Object.entries(error.response?.data?.details ?? {}).flatMap(([field, messages]) => (messages ?? []).map((message) => `${field}: ${message}`));
    return details.join(' ') || error.response?.data?.error || 'The application could not be submitted. Please try again.';
  }
  return 'The application could not be submitted. Please try again.';
}

function ShopApplicationForm() {
  const { register, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema), mode: 'onChange',
    defaultValues: { shopName: '', girlEmma: '', businessDescription: '', businessPhone: '', shopAddress: '', cityTownship: '', businessRegistrationNumber: '', businessEmail: '', ownerRole: '', websiteUrl: '' },
  });
  const shopLogo = watch('shopLogo');
  const verificationDocument = watch('verificationDocument');
  const setUser = useAuthStore((state) => state.setUser);
  const create = useMutation({
    mutationFn: shopApplicationService.create,
    onSuccess: (application) => {
      setUser({ ...useAuthStore.getState().user!, shopName: application.shopName, shopLogo: application.shopLogo, shopAddress: application.shopAddress, approvalStatus: 'PENDING', submittedAt: application.submittedAt });
      window.location.replace('/application');
    },
  });
  const submit = (values: ApplicationFormValues) => {
    const data = new FormData();
    const fields = ['shopName', 'businessCategory', 'businessDescription', 'businessPhone', 'businessEmail', 'shopAddress', 'cityTownship', 'ownerRole', 'businessRegistrationNumber', 'websiteUrl'] as const;
    fields.forEach((field) => data.append(field, values[field] ?? ''));
    data.append('shopLogo', values.shopLogo);
    data.append('verificationDocument', values.verificationDocument);
    create.mutate(data);
  };
  const input = (name: Exclude<keyof ApplicationFormValues, 'shopLogo' | 'verificationDocument'>): UseFormRegisterReturn => register(name);
  return <main className="page-container max-w-4xl">
    <PageHeader eyebrow="Step 2 of 2" title="Shop application" description="Tell us about your business. An administrator will review your application before your shop is approved." />
    <Card className="mt-6">
      <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit(submit)} noValidate>
        <label><FieldLabel required tooltip="Enter your official shop or business name as it appears on your license.">Shop / business name</FieldLabel><input className={fieldClass(errors.shopName)} {...input('shopName')} /><FieldErrorMessage error={errors.shopName} /></label>
        <label><FieldLabel>Girl Emma <span className="font-normal text-slate-500">(optional)</span></FieldLabel><input className={fieldClass(errors.girlEmma)} {...input('girlEmma')} /><FieldErrorMessage error={errors.girlEmma} /></label>
        <label className="sm:col-span-2"><FieldLabel required tooltip="Describe your business, products, or services in detail.">Business description</FieldLabel><textarea className={`${fieldClass(errors.businessDescription)} min-h-28 resize-y`} {...input('businessDescription')} /><FieldErrorMessage error={errors.businessDescription} /></label>
        <label><FieldLabel required tooltip="Enter a valid phone number where we can contact you.">Business phone</FieldLabel><input className={fieldClass(errors.businessPhone)} type="tel" {...input('businessPhone')} /><FieldErrorMessage error={errors.businessPhone} /></label>
        <label><FieldLabel required tooltip="Your physical business location address.">Business address</FieldLabel><input className={fieldClass(errors.shopAddress)} {...input('shopAddress')} /><FieldErrorMessage error={errors.shopAddress} /></label>
        <label><FieldLabel required tooltip="Select or enter your city or township.">City / township</FieldLabel><input className={fieldClass(errors.cityTownship)} {...input('cityTownship')} /><FieldErrorMessage error={errors.cityTownship} /></label>
        <label><FieldLabel tooltip="If you have a DICA or local business registration number, enter it here.">Business registration number <span className="font-normal text-slate-500">(optional)</span></FieldLabel><input className={fieldClass(errors.businessRegistrationNumber)} {...input('businessRegistrationNumber')} /><FieldErrorMessage error={errors.businessRegistrationNumber} /></label>
        <FileField id="shopLogo" label="Shop logo" tooltip="Upload your shop logo. JPG, PNG, or WebP, max 5MB." accept="image/jpeg,image/png,image/webp" file={shopLogo} error={errors.shopLogo} onChange={(file) => setValue('shopLogo', file as File, { shouldValidate: true, shouldDirty: true })} />
        <label><FieldLabel required tooltip="Select the category that best describes your business.">Business category</FieldLabel><select className={fieldClass(errors.businessCategory)} defaultValue="" {...input('businessCategory')}><option value="" disabled>Select a category</option>{['Retail', 'Wholesale', 'Food & Beverage', 'Services', 'Technology', 'Manufacturing', 'Other'].map((category) => <option key={category}>{category}</option>)}</select><FieldErrorMessage error={errors.businessCategory} /></label>
        <label><FieldLabel tooltip="Business email for official communications.">Business email <span className="font-normal text-slate-500">(optional)</span></FieldLabel><input className={fieldClass(errors.businessEmail)} type="email" {...input('businessEmail')} /><FieldErrorMessage error={errors.businessEmail} /></label>
        <label><FieldLabel required tooltip="Your position in the business (e.g., Founder, CEO, Manager).">Owner role</FieldLabel><input className={fieldClass(errors.ownerRole)} placeholder="e.g. Founder, CEO, Manager" {...input('ownerRole')} /><FieldErrorMessage error={errors.ownerRole} /></label>
        <label><FieldLabel tooltip="Paste your Facebook Page URL or website link.">Facebook page / website <span className="font-normal text-slate-500">(optional)</span></FieldLabel><input className={fieldClass(errors.websiteUrl)} type="url" placeholder="https://" {...input('websiteUrl')} /><FieldErrorMessage error={errors.websiteUrl} /></label>
        <FileField id="verificationDocument" label="Business proof / verification document" tooltip="Upload license, registration, or storefront photo as proof." accept="application/pdf,image/jpeg,image/png,image/webp" file={verificationDocument} error={errors.verificationDocument} onChange={(file) => setValue('verificationDocument', file as File, { shouldValidate: true, shouldDirty: true })} />
        {create.isError && <Alert className="sm:col-span-2" tone="error">{applicationError(create.error)}</Alert>}
        <div className="sm:col-span-2"><Button className="min-h-12 w-full sm:w-auto" disabled={!isValid || create.isPending}>{create.isPending ? 'Submitting…' : 'Submit for admin review'}</Button></div>
      </form>
    </Card>
  </main>;
}

export function ApplicationStatusPage() {
  const queryClient = useQueryClient();
  const application = useQuery({ queryKey: ['shop-application'], queryFn: shopApplicationService.get, refetchInterval: (query) => query.state.data?.submittedAt ? 15_000 : false });
  const [form, setForm] = useState({ name: '', shopName: '', phone: '', shopAddress: '' });
  const setUser = useAuthStore((state) => state.setUser);
  useEffect(() => { if (application.data) setForm({ name: application.data.name, shopName: application.data.shopName, phone: application.data.phone ?? '', shopAddress: application.data.shopAddress ?? '' }); }, [application.data]);
  useEffect(() => {
    if (application.data?.accountStatus === 'ACTIVE' && application.data.approvalStatus === 'APPROVED') {
      setUser({ ...useAuthStore.getState().user!, accountStatus: application.data.accountStatus, approvalStatus: application.data.approvalStatus, approvedAt: application.data.approvedAt });
      window.location.replace('/');
    }
  }, [application.data?.accountStatus, application.data?.approvalStatus, application.data?.approvedAt, setUser]);
  const update = useMutation({ mutationFn: shopApplicationService.update, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['shop-application'] }) });
  const resubmit = useMutation({ mutationFn: shopApplicationService.resubmit, onSuccess: async (data) => { setUser({ ...useAuthStore.getState().user!, approvalStatus: data.approvalStatus, submittedAt: data.submittedAt }); await queryClient.invalidateQueries({ queryKey: ['shop-application'] }); } });
  if (application.isLoading) return <main className="page-container"><Card className="mt-8 p-0"><LoadingState label="Loading application" /></Card></main>;
  if (!application.data) return <main className="page-container"><Alert className="mt-8" tone="error">Could not load your application.</Alert></main>;
  if (!application.data.submittedAt) return <ShopApplicationForm />;
  const editable = application.data.approvalStatus === 'CHANGES_REQUESTED';
  const feedback = application.data.reviewsReceived.filter((review) => review.feedback);
  return <main className="page-container max-w-4xl"><PageHeader eyebrow="Shop application" title="Application status" description="You can sign in while your application is reviewed. Business tools become available after approval." actions={<ApprovalStatusBadge status={application.data.approvalStatus} />} />
    {application.data.approvalStatus === 'DECLINED' && <Alert className="mt-6" tone="error">This application was declined. Please contact support if you need assistance.</Alert>}
    {application.data.approvalStatus === 'SUSPENDED' && <Alert className="mt-6" tone="error">This shop is suspended. Please contact support for further information.</Alert>}
    <Card className="mt-6"><h2 className="text-lg font-bold">Application details</h2><p className="mt-1 text-sm text-slate-500">Submitted {new Date(application.data.submittedAt).toLocaleString()}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2"><label><span className="mb-1 block text-sm font-medium">Owner name</span><input className="control" disabled={!editable} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label><span className="mb-1 block text-sm font-medium">Shop name</span><input className="control" disabled={!editable} value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} /></label><label><span className="mb-1 block text-sm font-medium">Phone</span><input className="control" disabled={!editable} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><label><span className="mb-1 block text-sm font-medium">Address</span><input className="control" disabled={!editable} value={form.shopAddress} onChange={(e) => setForm({ ...form, shopAddress: e.target.value })} /></label></div>
      {editable && <div className="mt-5 flex flex-wrap gap-3"><Button variant="outline" disabled={update.isPending} onClick={() => update.mutate({ ...form, phone: form.phone || null, shopAddress: form.shopAddress || null })}>{update.isPending ? 'Saving…' : 'Save changes'}</Button><Button disabled={resubmit.isPending} onClick={() => resubmit.mutate()}>{resubmit.isPending ? 'Resubmitting…' : 'Resubmit application'}</Button></div>}
      {(update.isError || resubmit.isError) && <Alert className="mt-4" tone="error">Your application could not be updated. Please try again.</Alert>}
    </Card>
    <Card className="mt-6"><h2 className="text-lg font-bold">Admin feedback & history</h2>{feedback.length ? <div className="mt-4 space-y-4">{application.data.reviewsReceived.map((review) => <div className="border-l-2 border-violet-300 pl-4" key={review.id}><div className="flex flex-wrap items-center gap-2"><ApprovalStatusBadge status={(review.nextStatus ?? application.data.approvalStatus)} /><span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleString()}</span></div>{review.feedback && <p className="mt-2 text-sm leading-6">{review.feedback}</p>}</div>)}</div> : <p className="mt-3 text-sm text-slate-500">No feedback has been recorded yet.</p>}</Card>
  </main>;
}
