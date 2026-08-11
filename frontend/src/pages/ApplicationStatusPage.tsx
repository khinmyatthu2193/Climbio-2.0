import { useEffect, useMemo, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { CircleHelp, FileText, LoaderCircle, X } from 'lucide-react';
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
import type { ShopApplication } from '@/types/shopApplication';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PROOF_TYPES = [...IMAGE_TYPES, 'application/pdf'];

const requiredFile = (types: string[], requiredMessage: string, sizeMessage: string, typeMessage: string) => z
  .custom<File>((value) => value instanceof File, requiredMessage)
  .refine((file) => !(file instanceof File) || file.size <= MAX_FILE_SIZE, sizeMessage)
  .refine((file) => !(file instanceof File) || types.includes(file.type), typeMessage);

const applicationTextFields = {
  shopName: z.string().trim().min(2, 'Shop name is required.').max(100, 'Shop name must not exceed 100 characters.'),
  ownerName: z.string().trim().min(2, 'Owner / authorized representative is required.').max(100),
  businessDescription: z.string().trim().min(20, 'Business description must contain at least 20 characters.').max(1000, 'Business description must not exceed 1000 characters.'),
  businessPhone: z.string().trim().min(1, 'Business phone is required.').regex(/^\+?[0-9\s()-]+$/, 'Enter a valid phone number.').refine((value) => value.replace(/\D/g, '').length >= 7, 'Enter a valid phone number.'),
  shopAddress: z.string().trim().min(5, 'Business address must contain at least 5 characters.').max(300),
  cityTownship: z.string().trim().min(2, 'City / township is required').max(100),
  businessRegistrationNumber: z.string().trim().max(100).optional(),
  businessCategory: z.enum(['Retail', 'Wholesale', 'Fashion & Apparel', 'Food & Beverage', 'Beauty & Personal Care', 'Electronics & Technology', 'Home & Living', 'Services', 'Manufacturing', 'Other'], { required_error: 'Please select a business category.' }),
  otherCategory: z.string().trim().max(100).optional(),
  businessEmail: z.union([z.literal(''), z.string().trim().email('Enter a valid email address').max(255)]).optional(),
  ownerRole: z.string().trim().min(2, 'Your role in the business is required.').max(80),
  websiteUrl: z.union([z.literal(''), z.string().trim().url('Enter a valid URL, including https://').max(500)]).optional(),
};

const validateOtherCategory = (values: { businessCategory: string; otherCategory?: string }, context: z.RefinementCtx) => {
  if (values.businessCategory === 'Other' && !values.otherCategory?.trim()) context.addIssue({ code: z.ZodIssueCode.custom, path: ['otherCategory'], message: 'Please specify the business category.' });
};

const optionalFile = (types: string[], sizeMessage: string, typeMessage: string) => z.custom<File>((value) => value === undefined || value instanceof File)
  .optional()
  .refine((file) => !file || file.size <= MAX_FILE_SIZE, sizeMessage)
  .refine((file) => !file || types.includes(file.type), typeMessage);

const applicationFormSchema = z.object({
  ...applicationTextFields,
  shopLogo: requiredFile(IMAGE_TYPES, 'Shop logo is required.', 'Logo must be smaller than 5 MB.', 'Only JPG, PNG, and WebP images are allowed.'),
  verificationDocument: requiredFile(PROOF_TYPES, 'Business verification document is required.', 'Verification file must be smaller than 5 MB.', 'Only PDF, JPG, PNG, and WebP files are allowed.'),
}).superRefine(validateOtherCategory);

const editApplicationSchema = z.object({
  ...applicationTextFields,
  shopLogo: optionalFile(IMAGE_TYPES, 'Logo must be smaller than 5 MB.', 'Only JPG, PNG, and WebP images are allowed.'),
  verificationDocument: optionalFile(PROOF_TYPES, 'Verification file must be smaller than 5 MB.', 'Only PDF, JPG, PNG, and WebP files are allowed.'),
}).superRefine(validateOtherCategory);

type ApplicationFormValues = z.infer<typeof editApplicationSchema>;

function FieldLabel({ children, required, tooltip }: { children: ReactNode; required?: boolean; tooltip?: string }) {
  return <span className="group relative mb-1.5 inline-flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
    {children}{required && <span className="text-red-600" aria-hidden="true">*</span>}
    {tooltip && <span className="relative inline-flex" tabIndex={0} aria-label={tooltip}>
      <CircleHelp className="h-4 w-4 cursor-help text-slate-400" aria-hidden="true" />
      <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-normal leading-5 text-white shadow-lg group-hover:block group-focus-within:block">
        {tooltip}
      </span>
    </span>}
  </span>;
}

function FieldErrorMessage({ error }: { error?: FieldError }) {
  return error ? <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">{error.message}</p> : null;
}

function FileField({ id, label, tooltip, accept, file, existingUrl, error, onChange }: { id: string; label: string; tooltip: string; accept: string; file?: File; existingUrl?: string | null; error?: FieldError; onChange: (file?: File) => void }) {
  const previewUrl = useMemo(() => file && IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE ? URL.createObjectURL(file) : undefined, [file]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  return <div>
    <FieldLabel required tooltip={tooltip}>{label}</FieldLabel>
    <label htmlFor={id} className={`flex min-h-11 cursor-pointer items-center overflow-hidden rounded-xl border bg-white text-sm shadow-sm transition dark:bg-slate-900 ${error ? 'border-red-500 ring-1 ring-red-200' : 'border-slate-200 hover:border-violet-300 dark:border-slate-700'}`}>
      <span className="self-stretch bg-violet-50 px-4 py-3 font-semibold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">Choose File</span>
      <span className="min-w-0 flex-1 truncate px-3 text-slate-500">{file?.name ?? 'No file chosen'}</span>
      <input id={id} className="sr-only" type="file" accept={accept} aria-required="true" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onChange={(event) => onChange(event.target.files?.[0])} />
    </label>
    {file && <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      {previewUrl ? <img className="h-14 w-14 rounded-lg object-cover" src={previewUrl} alt="Selected file preview" /> : <FileText className="h-10 w-10 text-violet-500" aria-hidden="true" />}
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{file.name}</p><p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
      <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-red-600 dark:hover:bg-slate-700" type="button" onClick={() => onChange(undefined)} aria-label={`Remove ${label}`}><X className="h-4 w-4" /></button>
    </div>}
    {!file && existingUrl && <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      {id === 'shopLogo' ? <img className="h-14 w-14 rounded-lg object-cover" src={existingUrl} alt="Current shop logo" /> : <FileText className="h-10 w-10 text-violet-500" aria-hidden="true" />}
      <a className="min-w-0 flex-1 truncate text-sm font-medium text-violet-600 hover:underline" href={existingUrl} target="_blank" rel="noreferrer">Current {label}</a>
    </div>}
    <div id={`${id}-error`}><FieldErrorMessage error={error} /></div>
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

function ShopApplicationForm({ ownerName, application }: { ownerName: string; application?: ShopApplication }) {
  const editing = Boolean(application);
  const knownCategories = ['Retail', 'Wholesale', 'Fashion & Apparel', 'Food & Beverage', 'Beauty & Personal Care', 'Electronics & Technology', 'Home & Living', 'Services', 'Manufacturing'];
  const currentCategory = application?.businessCategory ?? '';
  const activeSchema = editing ? editApplicationSchema.superRefine((values, context) => {
    if (!application?.shopLogo && !values.shopLogo) context.addIssue({ code: z.ZodIssueCode.custom, path: ['shopLogo'], message: 'Shop logo is required.' });
    if (!application?.verificationDocument && !values.verificationDocument) context.addIssue({ code: z.ZodIssueCode.custom, path: ['verificationDocument'], message: 'Business verification document is required.' });
  }) : applicationFormSchema;
  const { register, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm<ApplicationFormValues>({
    resolver: zodResolver(activeSchema), mode: 'onChange',
    defaultValues: {
      shopName: application?.shopName ?? '', ownerName: application?.name ?? ownerName,
      businessDescription: application?.businessDescription ?? '', businessPhone: application?.businessPhone ?? '',
      shopAddress: application?.shopAddress ?? '', cityTownship: application?.cityTownship ?? '',
      businessRegistrationNumber: application?.businessRegistrationNumber ?? '', businessEmail: application?.businessEmail ?? '',
      ownerRole: application?.ownerRole ?? '', websiteUrl: application?.websiteUrl ?? '',
      businessCategory: currentCategory ? (knownCategories.includes(currentCategory) ? currentCategory as ApplicationFormValues['businessCategory'] : 'Other') : undefined,
      otherCategory: currentCategory && !knownCategories.includes(currentCategory) ? currentCategory : '',
    },
  });
  const shopLogo = watch('shopLogo');
  const verificationDocument = watch('verificationDocument');
  const description = watch('businessDescription');
  const category = watch('businessCategory');
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: shopApplicationService.create,
    onSuccess: (application) => {
      setUser({ ...useAuthStore.getState().user!, name: application.name, shopName: application.shopName, shopLogo: application.shopLogo, shopAddress: application.shopAddress, approvalStatus: 'PENDING', submittedAt: application.submittedAt });
      window.location.replace('/application');
    },
  });
  const toFormData = (values: ApplicationFormValues) => {
    const data = new FormData();
    data.append('name', values.ownerName);
    data.append('shopName', values.shopName);
    data.append('businessCategory', values.businessCategory === 'Other' ? values.otherCategory!.trim() : values.businessCategory);
    const fields = ['businessDescription', 'businessPhone', 'businessEmail', 'shopAddress', 'cityTownship', 'ownerRole', 'businessRegistrationNumber', 'websiteUrl'] as const;
    fields.forEach((field) => data.append(field, values[field] ?? ''));
    if (values.shopLogo) data.append('shopLogo', values.shopLogo);
    if (values.verificationDocument) data.append('verificationDocument', values.verificationDocument);
    return data;
  };
  const save = useMutation({
    mutationFn: (values: ApplicationFormValues) => shopApplicationService.update(toFormData(values)),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['shop-application'] }),
  });
  const resubmit = useMutation({
    mutationFn: async (values: ApplicationFormValues) => { await shopApplicationService.update(toFormData(values)); return shopApplicationService.resubmit(); },
    onSuccess: async (updated) => {
      setUser({ ...useAuthStore.getState().user!, name: updated.name, shopName: updated.shopName, shopLogo: updated.shopLogo, shopAddress: updated.shopAddress, approvalStatus: updated.approvalStatus, submittedAt: updated.submittedAt });
      await queryClient.invalidateQueries({ queryKey: ['shop-application'] });
    },
  });
  const submit = (values: ApplicationFormValues) => editing ? save.mutate(values) : create.mutate(toFormData(values));
  const input = (name: Exclude<keyof ApplicationFormValues, 'shopLogo' | 'verificationDocument'>): UseFormRegisterReturn => register(name);
  return <main className="page-container max-w-4xl">
    <PageHeader eyebrow={editing ? 'Changes requested' : 'Step 2 of 2'} title={editing ? 'Update your application' : 'Apply to Open Your Shop'} description={editing ? 'Update the requested information, save your progress, then resubmit it for admin review.' : 'Provide your business information below. Our admin team will review your application before your shop becomes active.'} actions={application && <ApprovalStatusBadge status={application.approvalStatus} />} />
    {!editing && <Alert className="mt-6" tone="info">Your shop will not be publicly available until the application is approved.</Alert>}
    <Card className="mt-6">
      <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit(submit)} noValidate>
        <h2 className="border-b border-slate-200 pb-2 text-base font-bold dark:border-slate-700 sm:col-span-2">Business Information</h2>
        <label><FieldLabel required tooltip="Enter the public or registered name of your shop or business.">Shop / Business Name</FieldLabel><input className={fieldClass(errors.shopName)} placeholder="e.g. Urban Style" aria-required="true" aria-invalid={Boolean(errors.shopName)} {...input('shopName')} /><FieldErrorMessage error={errors.shopName} /></label>
        <label><FieldLabel required tooltip="Select the category that best represents your primary business activity.">Business Category</FieldLabel><select className={fieldClass(errors.businessCategory)} defaultValue="" aria-required="true" aria-invalid={Boolean(errors.businessCategory)} {...input('businessCategory')}><option value="" disabled>Select a category</option>{['Retail', 'Wholesale', 'Fashion & Apparel', 'Food & Beverage', 'Beauty & Personal Care', 'Electronics & Technology', 'Home & Living', 'Services', 'Manufacturing', 'Other'].map((item) => <option key={item}>{item}</option>)}</select><FieldErrorMessage error={errors.businessCategory} /></label>
        {category === 'Other' && <label className="sm:col-span-2"><FieldLabel required>Specify Business Category</FieldLabel><input className={fieldClass(errors.otherCategory)} aria-required="true" aria-invalid={Boolean(errors.otherCategory)} {...input('otherCategory')} /><FieldErrorMessage error={errors.otherCategory} /></label>}
        <label className="sm:col-span-2"><FieldLabel required tooltip="Describe your business, products, or services so the admin can understand what your shop does.">Business Description</FieldLabel><textarea className={`${fieldClass(errors.businessDescription)} min-h-28 resize-y`} placeholder="Tell us briefly what your business sells or provides..." maxLength={1000} aria-required="true" aria-invalid={Boolean(errors.businessDescription)} {...input('businessDescription')} /><div className="flex justify-between"><FieldErrorMessage error={errors.businessDescription} /><span className="ml-auto mt-1.5 text-xs text-slate-500">{description?.length ?? 0} / 1000</span></div></label>
        <FileField id="shopLogo" label="Shop logo" tooltip="Upload your shop logo. JPG, PNG, or WebP, max 5MB." accept="image/jpeg,image/png,image/webp" file={shopLogo} existingUrl={application?.shopLogo} error={errors.shopLogo} onChange={(file) => setValue('shopLogo', file, { shouldValidate: true, shouldDirty: true })} />
        <h2 className="mt-2 border-b border-slate-200 pb-2 text-base font-bold dark:border-slate-700 sm:col-span-2">Owner &amp; Contact Information</h2>
        <label><FieldLabel required tooltip="Enter the name of the owner or person authorized to manage this shop.">Owner / Authorized Representative</FieldLabel><input className={fieldClass(errors.ownerName)} placeholder="Enter your full name" aria-required="true" aria-invalid={Boolean(errors.ownerName)} {...input('ownerName')} /><FieldErrorMessage error={errors.ownerName} /></label>
        <label><FieldLabel required tooltip="Enter your position or responsibility in this business.">Your Role in the Business</FieldLabel><input className={fieldClass(errors.ownerRole)} placeholder="e.g. Founder, Owner, Manager" aria-required="true" aria-invalid={Boolean(errors.ownerRole)} {...input('ownerRole')} /><FieldErrorMessage error={errors.ownerRole} /></label>
        <label><FieldLabel required tooltip="Enter a phone number where the admin can contact the business owner or representative.">Business Phone</FieldLabel><input className={fieldClass(errors.businessPhone)} type="tel" placeholder="e.g. +95 9 123 456 789" aria-required="true" aria-invalid={Boolean(errors.businessPhone)} {...input('businessPhone')} /><FieldErrorMessage error={errors.businessPhone} /></label>
        <label><FieldLabel tooltip="Optional email address for shop-related and administrative communication.">Business Email <span className="font-normal text-slate-500">(Optional)</span></FieldLabel><input className={fieldClass(errors.businessEmail)} type="email" placeholder="business@example.com" aria-invalid={Boolean(errors.businessEmail)} {...input('businessEmail')} /><FieldErrorMessage error={errors.businessEmail} /></label>
        <h2 className="mt-2 border-b border-slate-200 pb-2 text-base font-bold dark:border-slate-700 sm:col-span-2">Business Location</h2>
        <label className="sm:col-span-2"><FieldLabel required tooltip="Enter the primary physical location of your business.">Business Address</FieldLabel><textarea className={`${fieldClass(errors.shopAddress)} min-h-20 resize-y`} placeholder="Street, building, ward, etc." aria-required="true" aria-invalid={Boolean(errors.shopAddress)} {...input('shopAddress')} /><FieldErrorMessage error={errors.shopAddress} /></label>
        <label><FieldLabel required tooltip="Enter or select the city or township where your business is located.">City / Township</FieldLabel><input className={fieldClass(errors.cityTownship)} placeholder="e.g. Kamayut" aria-required="true" aria-invalid={Boolean(errors.cityTownship)} {...input('cityTownship')} /><FieldErrorMessage error={errors.cityTownship} /></label>
        <h2 className="mt-2 border-b border-slate-200 pb-2 text-base font-bold dark:border-slate-700 sm:col-span-2">Verification Information</h2>
        <label><FieldLabel tooltip="If your business has a DICA or other official registration number, enter it here.">Business Registration Number <span className="font-normal text-slate-500">(Optional)</span></FieldLabel><input className={fieldClass(errors.businessRegistrationNumber)} placeholder="Enter registration number" aria-invalid={Boolean(errors.businessRegistrationNumber)} {...input('businessRegistrationNumber')} /><FieldErrorMessage error={errors.businessRegistrationNumber} /></label>
        <label><FieldLabel tooltip="Add your official Facebook Page or website so the admin can verify your business presence.">Facebook Page / Website <span className="font-normal text-slate-500">(Optional)</span></FieldLabel><input className={fieldClass(errors.websiteUrl)} type="url" placeholder="https://facebook.com/yourshop or https://yourshop.com" aria-invalid={Boolean(errors.websiteUrl)} {...input('websiteUrl')} /><FieldErrorMessage error={errors.websiteUrl} /></label>
        <div className="sm:col-span-2"><FileField id="verificationDocument" label="Business Verification" tooltip="Upload a license, registration document, storefront photo, or other reasonable proof that this business is genuine." accept="application/pdf,image/jpeg,image/png,image/webp" file={verificationDocument} existingUrl={application?.verificationDocument} error={errors.verificationDocument} onChange={(file) => setValue('verificationDocument', file, { shouldValidate: true, shouldDirty: true })} /></div>
        {(create.isError || save.isError || resubmit.isError) && <Alert className="sm:col-span-2" tone="error">{applicationError(create.error ?? save.error ?? resubmit.error)}</Alert>}
        {save.isSuccess && <Alert className="sm:col-span-2" tone="success">Changes saved. Your application remains in Changes Requested until you resubmit it.</Alert>}
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          {editing && <Button type="submit" variant="outline" className="min-h-12" disabled={!isValid || save.isPending || resubmit.isPending}>{save.isPending ? 'Saving...' : 'Save changes'}</Button>}
          <Button type={editing ? 'button' : 'submit'} className="min-h-12 w-full sm:w-auto" disabled={!isValid || create.isPending || save.isPending || resubmit.isPending} onClick={editing ? handleSubmit((values) => resubmit.mutate(values)) : undefined}>{(create.isPending || resubmit.isPending) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}{create.isPending || resubmit.isPending ? 'Submitting...' : 'Submit for admin review'}</Button>
        </div>
      </form>
    </Card>
    {application && <Card className="mt-6"><h2 className="text-lg font-bold">Admin feedback &amp; history</h2>{application.reviewsReceived.length ? <div className="mt-4 space-y-4">{application.reviewsReceived.map((review) => <div className="border-l-2 border-violet-300 pl-4" key={review.id}><div className="flex flex-wrap items-center gap-2"><ApprovalStatusBadge status={(review.nextStatus ?? application.approvalStatus)} /><span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleString()}</span></div>{review.feedback && <p className="mt-2 text-sm leading-6">{review.feedback}</p>}</div>)}</div> : <p className="mt-3 text-sm text-slate-500">No feedback has been recorded yet.</p>}</Card>}
  </main>;
}

export function ApplicationStatusPage() {
  const application = useQuery({ queryKey: ['shop-application'], queryFn: shopApplicationService.get, refetchInterval: (query) => query.state.data?.submittedAt ? 15_000 : false });
  const setUser = useAuthStore((state) => state.setUser);
  useEffect(() => {
    if (application.data?.accountStatus === 'ACTIVE' && application.data.approvalStatus === 'APPROVED') {
      setUser({ ...useAuthStore.getState().user!, accountStatus: application.data.accountStatus, approvalStatus: application.data.approvalStatus, approvedAt: application.data.approvedAt });
      window.location.replace('/');
    }
  }, [application.data?.accountStatus, application.data?.approvalStatus, application.data?.approvedAt, setUser]);
  if (application.isLoading) return <main className="page-container"><Card className="mt-8 p-0"><LoadingState label="Loading application" /></Card></main>;
  if (!application.data) return <main className="page-container"><Alert className="mt-8" tone="error">Could not load your application.</Alert></main>;
  if (!application.data.submittedAt) return <ShopApplicationForm ownerName={application.data.name} />;
  if (application.data.approvalStatus === 'CHANGES_REQUESTED') return <ShopApplicationForm ownerName={application.data.name} application={application.data} />;
  const feedback = application.data.reviewsReceived.filter((review) => review.feedback);
  return <main className="page-container max-w-4xl"><PageHeader eyebrow="Shop application" title="Application status" description="You can sign in while your application is reviewed. Business tools become available after approval." actions={<ApprovalStatusBadge status={application.data.approvalStatus} />} />
    {application.data.approvalStatus === 'DECLINED' && <Alert className="mt-6" tone="error">This application was declined. Please contact support if you need assistance.</Alert>}
    {application.data.approvalStatus === 'SUSPENDED' && <Alert className="mt-6" tone="error">This shop is suspended. Please contact support for further information.</Alert>}
    <Card className="mt-6"><h2 className="text-lg font-bold">Application details</h2><p className="mt-1 text-sm text-slate-500">Submitted {new Date(application.data.submittedAt).toLocaleString()}</p>
      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        {[['Shop name', application.data.shopName], ['Owner name', application.data.name], ['Business category', application.data.businessCategory], ['Business phone', application.data.businessPhone], ['Business email', application.data.businessEmail], ['Owner role', application.data.ownerRole], ['City / township', application.data.cityTownship], ['Registration number', application.data.businessRegistrationNumber]].map(([label, value]) => <div key={label}><dt className="text-slate-500">{label}</dt><dd className="font-semibold">{value || 'Not provided'}</dd></div>)}
        <div className="sm:col-span-2"><dt className="text-slate-500">Business description</dt><dd className="font-semibold">{application.data.businessDescription}</dd></div>
        <div className="sm:col-span-2"><dt className="text-slate-500">Business address</dt><dd className="font-semibold">{application.data.shopAddress}</dd></div>
        <div><dt className="text-slate-500">Facebook / website</dt><dd>{application.data.websiteUrl ? <a className="font-semibold text-violet-600 hover:underline" href={application.data.websiteUrl} target="_blank" rel="noreferrer">Open link</a> : 'Not provided'}</dd></div>
        <div><dt className="text-slate-500">Files</dt><dd className="flex gap-3">{application.data.shopLogo && <a className="font-semibold text-violet-600 hover:underline" href={application.data.shopLogo} target="_blank" rel="noreferrer">Shop logo</a>}{application.data.verificationDocument && <a className="font-semibold text-violet-600 hover:underline" href={application.data.verificationDocument} target="_blank" rel="noreferrer">Verification</a>}</dd></div>
      </dl>
    </Card>
    <Card className="mt-6"><h2 className="text-lg font-bold">Admin feedback & history</h2>{feedback.length ? <div className="mt-4 space-y-4">{application.data.reviewsReceived.map((review) => <div className="border-l-2 border-violet-300 pl-4" key={review.id}><div className="flex flex-wrap items-center gap-2"><ApprovalStatusBadge status={(review.nextStatus ?? application.data.approvalStatus)} /><span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleString()}</span></div>{review.feedback && <p className="mt-2 text-sm leading-6">{review.feedback}</p>}</div>)}</div> : <p className="mt-3 text-sm text-slate-500">No feedback has been recorded yet.</p>}</Card>
  </main>;
}
