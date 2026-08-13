import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Check, Copy, ExternalLink, Facebook, Mail, Package, Power, Send, Share2, Store, Upload, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { IconLabel } from '@/components/ui/IconLabel';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/common/PageHeader';
import { authService } from '@/services/authService';
import { publicShopService } from '@/services/publicShopService';
import { useAuthStore } from '@/store/authStore';
import { useLanguage } from '@/hooks/useLanguage';
import { getPublicShopUrl } from '@/utils/publicShopUrl';

const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const storeCopy = {
  en: {
    loading: 'Loading public store…', loadError: 'Public store settings could not be loaded.', eyebrow: 'Sales channel', title: 'My public store', description: 'Manage, preview, and share your customer catalog.', active: 'Active', inactive: 'Inactive',
    shopLogo: 'Shop logo', noAddress: 'No shop address', visibleProducts: 'visible products', changeLogo: 'Change logo', logoError: 'Logo upload failed.', catalogLink: 'Catalog link', copied: 'Copied', copyLink: 'Copy Link', share: 'Share', shareTitle: 'Share your store', openStore: 'Open Store', facebook: 'Share on Facebook', whatsapp: 'Share on WhatsApp',
    availability: 'Store availability', availabilityHelp: 'Disabled stores cannot be opened by customers.', updating: 'Updating…', disable: 'Disable store', enable: 'Enable store', availabilityError: 'Store availability could not be changed.',
    information: 'Store information', shopName: 'Shop name', slug: 'Public slug', slugPreview: 'Your store URL:', slugInvalid: 'Use lowercase letters, numbers, and single hyphens only.', phone: 'Phone', address: 'Address', saved: 'Store information saved.', saveError: 'Could not save store information.', saving: 'Saving…', save: 'Save store information', qrTitle: 'Store QR Code', qrHelp: 'Customers can scan to open your catalog.', visit: 'Visit',
  },
  my: {
    loading: 'အများမြင်ဆိုင်ကို ဖွင့်နေသည်…', loadError: 'အများမြင်ဆိုင် ဆက်တင်များကို ဖွင့်၍မရပါ။', eyebrow: 'အရောင်းချန်နယ်', title: 'ကျွန်ုပ်၏ အများမြင်ဆိုင်', description: 'ဝယ်ယူသူများအတွက် ကုန်ပစ္စည်းစာရင်းကို စီမံ၊ အစမ်းကြည့်ပြီး မျှဝေပါ။', active: 'အသုံးပြုနေသည်', inactive: 'ပိတ်ထားသည်',
    shopLogo: 'ဆိုင်လိုဂို', noAddress: 'ဆိုင်လိပ်စာ မရှိသေးပါ', visibleProducts: 'ခု မြင်နိုင်သော ကုန်ပစ္စည်း', changeLogo: 'လိုဂိုပြောင်းရန်', logoError: 'လိုဂိုတင်၍ မရပါ။', catalogLink: 'ကုန်ပစ္စည်းစာရင်းလင့်ခ်', copied: 'ကူးယူပြီး', copyLink: 'လင့်ခ်ကူးရန်', share: 'မျှဝေရန်', shareTitle: 'ဆိုင်ကို မျှဝေရန်', openStore: 'ဆိုင်ဖွင့်ကြည့်ရန်', facebook: 'Facebook တွင် မျှဝေရန်', whatsapp: 'WhatsApp တွင် မျှဝေရန်',
    availability: 'ဆိုင်အသုံးပြုနိုင်မှု', availabilityHelp: 'ပိတ်ထားသောဆိုင်ကို ဝယ်ယူသူများ ဖွင့်ကြည့်၍မရပါ။', updating: 'ပြောင်းလဲနေသည်…', disable: 'ဆိုင်ပိတ်ရန်', enable: 'ဆိုင်ဖွင့်ရန်', availabilityError: 'ဆိုင်အသုံးပြုနိုင်မှုကို ပြောင်း၍မရပါ။',
    information: 'ဆိုင်အချက်အလက်', shopName: 'ဆိုင်အမည်', slug: 'အများမြင်လင့်ခ်အမည်', slugPreview: 'သင့်ဆိုင်လင့်ခ်:', slugInvalid: 'အင်္ဂလိပ်စာလုံးအသေး၊ နံပါတ်နှင့် တစ်ဆက်တည်းမဟုတ်သော hyphen များကိုသာ သုံးပါ။', phone: 'ဖုန်းနံပါတ်', address: 'လိပ်စာ', saved: 'ဆိုင်အချက်အလက် သိမ်းပြီးပါပြီ။', saveError: 'ဆိုင်အချက်အလက်ကို မသိမ်းနိုင်ပါ။', saving: 'သိမ်းနေသည်…', save: 'ဆိုင်အချက်အလက် သိမ်းရန်', qrTitle: 'ဆိုင် QR ကုဒ်', qrHelp: 'ဝယ်ယူသူများက Scan ဖတ်၍ ကုန်ပစ္စည်းစာရင်းကို ဖွင့်နိုင်ပါသည်။', visit: 'ကြည့်ရှုရန်',
  },
};

export function MyPublicStore() {
  const { language } = useLanguage();
  const copy = storeCopy[language];
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user)!;
  const setUser = useAuthStore((state) => state.setUser);
  const store = useQuery({ queryKey: ['my-public-store'], queryFn: publicShopService.getMyStore });
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({ slug: '', shopName: '', phone: '', shopAddress: '' });

  useEffect(() => {
    if (!store.data) return;
    setForm({
      slug: store.data.slug,
      shopName: store.data.shopInfo.shopName,
      phone: store.data.shopInfo.phone ?? '',
      shopAddress: store.data.shopInfo.shopAddress ?? '',
    });
  }, [store.data]);

  const statusMutation = useMutation({
    mutationFn: publicShopService.updateStatus,
    onSuccess: (data) => queryClient.setQueryData(['my-public-store'], data),
  });
  const detailsMutation = useMutation({
    mutationFn: publicShopService.updateMyStore,
    onSuccess: (data) => {
      queryClient.setQueryData(['my-public-store'], data);
      setUser({ ...user, shopName: data.shopInfo.shopName, phone: data.shopInfo.phone, shopAddress: data.shopInfo.shopAddress });
    },
  });
  const logoMutation = useMutation({
    mutationFn: authService.uploadLogo,
    onSuccess: async (updatedUser) => {
      setUser(updatedUser);
      await queryClient.invalidateQueries({ queryKey: ['my-public-store'] });
    },
  });

  const copyLink = async () => {
    if (!store.data) return;
    await navigator.clipboard.writeText(getPublicShopUrl(store.data.slug, store.data.publicUrl));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!shareOpen) return;
    const closeOutside = (event: MouseEvent) => !shareMenuRef.current?.contains(event.target as Node) && setShareOpen(false);
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setShareOpen(false);
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.removeEventListener('mousedown', closeOutside); document.removeEventListener('keydown', closeOnEscape); };
  }, [shareOpen]);

  const saveDetails = (event: FormEvent) => {
    event.preventDefault();
    detailsMutation.mutate({
      slug: form.slug.trim(),
      shopName: form.shopName,
      phone: form.phone || null,
      shopAddress: form.shopAddress || null,
    });
  };

  if (store.isLoading) return <main className="page-container"><Card className="animate-pulse text-slate-500">{copy.loading}</Card></main>;
  if (store.isError || !store.data) return <main className="page-container"><Alert tone="error">{copy.loadError}</Alert></main>;

  const publicUrl = getPublicShopUrl(store.data.slug, store.data.publicUrl);
  const previewUrl = getPublicShopUrl(form.slug.trim(), store.data.publicUrl);
  const slugError = form.slug.length > 0 && !validSlug.test(form.slug);
  const shareMessage = `Check out ${store.data.shopInfo.shopName} on Climbio.`;
  const shareText = encodeURIComponent(`${shareMessage} ${publicUrl}`);
  const shareUrl = encodeURIComponent(publicUrl);
  const mutationError = detailsMutation.error && axios.isAxiosError(detailsMutation.error)
    ? (detailsMutation.error.response?.data as { error?: string } | undefined)?.error
    : undefined;
  const shareStore = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: store.data.shopInfo.shopName, text: shareMessage, url: publicUrl }); return; }
      catch (error) { if (error instanceof DOMException && error.name === 'AbortError') return; }
    }
    setShareOpen(true);
  };

  return (
    <main className="page-container">
      <div className="max-w-6xl">
        <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} actions={
          <Badge className={`gap-2 px-3 py-2 text-sm ${store.data.publicEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
            <span className={`h-2 w-2 rounded-full ${store.data.publicEnabled ? 'bg-emerald-500' : 'bg-slate-500'}`} />
            {store.data.publicEnabled ? copy.active : copy.inactive}
          </Badge>
        } />

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_310px]">
          <div className="space-y-6">
            <Card>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {store.data.shopInfo.shopLogo ? (
                  <img className="h-24 w-24 rounded-3xl border object-cover" src={store.data.shopInfo.shopLogo} alt={copy.shopLogo} />
                ) : (
                  <div className="grid h-24 w-24 place-items-center rounded-3xl bg-emerald-100 text-primary"><Store size={38} /></div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{store.data.shopInfo.shopName}</h2>
                  <p className="mt-1 text-sm text-slate-500">{store.data.shopInfo.shopAddress || copy.noAddress}</p>
                  <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary"><IconLabel icon={Package}>{store.data.productCount} {copy.visibleProducts}</IconLabel></div>
                </div>
                <label className="cursor-pointer rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                  <IconLabel icon={Upload}>{copy.changeLogo}</IconLabel>
                  <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) logoMutation.mutate(file);
                  }} />
                </label>
              </div>
              {logoMutation.isError && <p className="mt-3 text-sm text-red-600">{copy.logoError}</p>}
            </Card>

            <Card>
              <h2 className="text-lg font-bold">{copy.catalogLink}</h2>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <a className="min-w-0 flex-1 cursor-pointer truncate rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:bg-violet-500/10" href={publicUrl} target="_blank" rel="noreferrer">{publicUrl}</a>
                <Button className="flex items-center justify-center gap-2" onClick={copyLink}>
                  <IconLabel icon={copied ? Check : Copy}>{copied ? copy.copied : copy.copyLink}</IconLabel>
                </Button>
                <div className="relative" ref={shareMenuRef}>
                  <Button className="w-full" variant="outline" onClick={shareStore} aria-haspopup="dialog" aria-expanded={shareOpen}><Share2 size={17} />{copy.share}</Button>
                  {shareOpen && (
                    <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900" role="dialog" aria-label={copy.shareTitle}>
                      <div className="mb-2 flex items-center justify-between px-1"><p className="text-sm font-bold">{copy.shareTitle}</p><button className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setShareOpen(false)} aria-label="Close share menu"><X size={16} /></button></div>
                      <div className="grid gap-1 text-sm font-medium">
                        <a className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer"><IconLabel icon={Facebook}>Facebook</IconLabel></a>
                        <a className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer">WhatsApp</a>
                        <a className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href={`https://t.me/share/url?url=${shareUrl}&text=${encodeURIComponent(shareMessage)}`} target="_blank" rel="noreferrer"><IconLabel icon={Send}>Telegram</IconLabel></a>
                        <a className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href={`mailto:?subject=${encodeURIComponent(store.data.shopInfo.shopName)}&body=${shareText}`}><IconLabel icon={Mail}>Email</IconLabel></a>
                        <button className="rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => { void copyLink(); setShareOpen(false); }}><IconLabel icon={Copy}>{copy.copyLink}</IconLabel></button>
                      </div>
                    </div>
                  )}
                </div>
                <a
                  className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-white ${store.data.publicEnabled ? 'bg-slate-700 hover:opacity-90' : 'pointer-events-none bg-slate-300'}`}
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconLabel icon={ExternalLink}>{copy.openStore}</IconLabel>
                </a>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <a className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1877F2] px-4 py-2 font-semibold text-white hover:opacity-90" href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer">
                  <IconLabel icon={Facebook}>{copy.facebook}</IconLabel>
                </a>
                <a className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 font-semibold text-white hover:opacity-90" href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer">
                  {copy.whatsapp}
                </a>
              </div>
            </Card>

            <Card>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold">{copy.availability}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{copy.availabilityHelp}</p>
                </div>
                <Button
                  variant={store.data.publicEnabled ? 'danger' : 'secondary'}
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate(!store.data.publicEnabled)}
                >
                  <Power size={17} />
                  {statusMutation.isPending ? copy.updating : store.data.publicEnabled ? copy.disable : copy.enable}
                </Button>
              </div>
              {statusMutation.isError && <Alert className="mt-4" tone="error">{copy.availabilityError}</Alert>}
            </Card>

            <Card>
              <h2 className="text-lg font-bold">{copy.information}</h2>
              <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={saveDetails}>
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium">{copy.shopName}</span>
                  <Input value={form.shopName} maxLength={100} onChange={(event) => setForm({ ...form, shopName: event.target.value })} required />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium">{copy.slug}</span>
                  <Input value={form.slug} maxLength={120} aria-invalid={slugError} onChange={(event) => setForm({ ...form, slug: event.target.value })} required />
                  {slugError && <p className="mt-1 text-xs font-medium text-red-600">{copy.slugInvalid}</p>}
                  <p className="mt-2 text-xs text-slate-500"><span className="font-semibold">{copy.slugPreview}</span> <span className="break-all">{previewUrl}</span></p>
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium">{copy.phone}</span>
                  <Input value={form.phone} maxLength={30} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium">{copy.address}</span>
                  <Input value={form.shopAddress} maxLength={500} onChange={(event) => setForm({ ...form, shopAddress: event.target.value })} />
                </label>
                <div className="sm:col-span-2">
                  {detailsMutation.isSuccess && <Alert className="mb-3" tone="success">{copy.saved}</Alert>}
                  {detailsMutation.isError && <Alert className="mb-3" tone="error">{mutationError || copy.saveError}</Alert>}
                  <Button type="submit" disabled={detailsMutation.isPending || slugError}>{detailsMutation.isPending ? copy.saving : copy.save}</Button>
                </div>
              </form>
            </Card>
          </div>

          <Card className="h-fit text-center lg:sticky lg:top-8">
            <h2 className="text-lg font-bold">{copy.qrTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">{copy.qrHelp}</p>
            <div className={`mx-auto mt-6 w-fit rounded-2xl border bg-white p-4 ${store.data.publicEnabled ? '' : 'opacity-40'}`}>
              <QRCodeSVG value={publicUrl} size={210} level="H" includeMargin />
            </div>
            <p className="mt-4 break-all text-xs text-slate-500">{publicUrl}</p>
          </Card>
        </section>
      </div>
    </main>
  );
}
