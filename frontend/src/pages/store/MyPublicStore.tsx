import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, ExternalLink, Facebook, Package, Store, Upload } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/common/PageHeader';
import { authService } from '@/services/authService';
import { publicShopService } from '@/services/publicShopService';
import { useAuthStore } from '@/store/authStore';

export function MyPublicStore() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user)!;
  const setUser = useAuthStore((state) => state.setUser);
  const store = useQuery({ queryKey: ['my-public-store'], queryFn: publicShopService.getMyStore });
  const [copied, setCopied] = useState(false);
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
    await navigator.clipboard.writeText(store.data.publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const saveDetails = (event: FormEvent) => {
    event.preventDefault();
    detailsMutation.mutate({
      slug: form.slug.trim().toLowerCase(),
      shopName: form.shopName,
      phone: form.phone || null,
      shopAddress: form.shopAddress || null,
    });
  };

  if (store.isLoading) return <main className="page-container"><Card className="animate-pulse text-slate-500">Loading public store…</Card></main>;
  if (store.isError || !store.data) return <main className="page-container"><Alert tone="error">Public store settings could not be loaded.</Alert></main>;

  const shareText = encodeURIComponent(`Visit ${store.data.shopInfo.shopName}: ${store.data.publicUrl}`);
  const shareUrl = encodeURIComponent(store.data.publicUrl);

  return (
    <main className="page-container">
      <div className="max-w-6xl">
        <PageHeader eyebrow="Sales channel" title="My public store" description="Manage, preview, and share your customer catalog." actions={
          <Badge className={`gap-2 px-3 py-2 text-sm ${store.data.publicEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
            <span className={`h-2 w-2 rounded-full ${store.data.publicEnabled ? 'bg-emerald-500' : 'bg-slate-500'}`} />
            {store.data.publicEnabled ? 'Active' : 'Inactive'}
          </Badge>
        } />

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_310px]">
          <div className="space-y-6">
            <Card>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {store.data.shopInfo.shopLogo ? (
                  <img className="h-24 w-24 rounded-3xl border object-cover" src={store.data.shopInfo.shopLogo} alt="Shop logo" />
                ) : (
                  <div className="grid h-24 w-24 place-items-center rounded-3xl bg-emerald-100 text-primary"><Store size={38} /></div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{store.data.shopInfo.shopName}</h2>
                  <p className="mt-1 text-sm text-slate-500">{store.data.shopInfo.shopAddress || 'No shop address'}</p>
                  <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary"><Package size={17} />{store.data.productCount} visible products</div>
                </div>
                <label className="cursor-pointer rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                  <span className="flex items-center gap-2"><Upload size={16} /> Change logo</span>
                  <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) logoMutation.mutate(file);
                  }} />
                </label>
              </div>
              {logoMutation.isError && <p className="mt-3 text-sm text-red-600">Logo upload failed.</p>}
            </Card>

            <Card>
              <h2 className="text-lg font-bold">Catalog link</h2>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="min-w-0 flex-1 truncate rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{store.data.publicUrl}</div>
                <Button className="flex items-center justify-center gap-2" onClick={copyLink}>
                  {copied ? <Check size={17} /> : <Copy size={17} />}{copied ? 'Copied' : 'Copy Link'}
                </Button>
                <a
                  className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-white ${store.data.publicEnabled ? 'bg-slate-700 hover:opacity-90' : 'pointer-events-none bg-slate-300'}`}
                  href={store.data.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={17} /> Open Store
                </a>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <a className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1877F2] px-4 py-2 font-semibold text-white hover:opacity-90" href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer">
                  <Facebook size={18} /> Share on Facebook
                </a>
                <a className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 font-semibold text-white hover:opacity-90" href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer">
                  Share on WhatsApp
                </a>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-bold">Store information</h2>
              <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={saveDetails}>
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium">Shop name</span>
                  <Input value={form.shopName} maxLength={100} onChange={(event) => setForm({ ...form, shopName: event.target.value })} required />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium">Public slug</span>
                  <Input value={form.slug} maxLength={120} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" onChange={(event) => setForm({ ...form, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} required />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium">Phone</span>
                  <Input value={form.phone} maxLength={30} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium">Address</span>
                  <Input value={form.shopAddress} maxLength={500} onChange={(event) => setForm({ ...form, shopAddress: event.target.value })} />
                </label>
                <div className="sm:col-span-2">
                  {detailsMutation.isSuccess && <Alert className="mb-3" tone="success">Store information saved.</Alert>}
                  {detailsMutation.isError && <Alert className="mb-3" tone="error">Could not save store information. The slug may already be in use.</Alert>}
                  <Button type="submit" disabled={detailsMutation.isPending}>{detailsMutation.isPending ? 'Saving…' : 'Save store information'}</Button>
                </div>
              </form>
            </Card>
          </div>

          <Card className="h-fit text-center lg:sticky lg:top-8">
            <h2 className="text-lg font-bold">Store QR Code</h2>
            <p className="mt-1 text-sm text-slate-500">Customers can scan to open your catalog.</p>
            <div className={`mx-auto mt-6 w-fit rounded-2xl border bg-white p-4 ${store.data.publicEnabled ? '' : 'opacity-40'}`}>
              <QRCodeSVG value={store.data.publicUrl} size={210} level="H" includeMargin />
            </div>
            <p className="mt-4 break-all text-xs text-slate-500">{store.data.publicUrl}</p>
          </Card>
        </section>
      </div>
    </main>
  );
}
