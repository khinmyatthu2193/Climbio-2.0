import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Facebook, Mail, MapPin, MessageCircle, Moon, Music2, PackageOpen, Phone, Search, Send, ShoppingBag, Sun, X } from 'lucide-react';
import { IconLabel } from '@/components/ui/IconLabel';
import { publicShopService } from '@/services/publicShopService';
import type { PublicShopProduct } from '@/types/publicShop';

export function PublicShop({ slug }: { slug: string }) {
  const catalog = useQuery({ queryKey: ['public-shop', slug], queryFn: () => publicShopService.get(slug), retry: 1 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<PublicShopProduct | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const contactCloseRef = useRef<HTMLButtonElement>(null);
  const contactTriggerRef = useRef<HTMLButtonElement>(null);
  const [publicTheme, setPublicTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('climbio-public-theme') === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    const applyTheme = () => { document.documentElement.classList.toggle('dark', publicTheme === 'dark'); document.documentElement.style.colorScheme = publicTheme; };
    applyTheme();
    const frame = window.requestAnimationFrame(applyTheme);
    localStorage.setItem('climbio-public-theme', publicTheme);
    return () => window.cancelAnimationFrame(frame);
  }, [publicTheme]);

  useEffect(() => {
    const canonicalSlug = catalog.data?.canonicalSlug;
    if (canonicalSlug && canonicalSlug !== slug) window.location.replace(`/shop/${canonicalSlug}`);
  }, [catalog.data?.canonicalSlug, slug]);

  useEffect(() => {
    if (!contactOpen) return;
    contactCloseRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setContactOpen(false);
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.removeEventListener('keydown', closeOnEscape); contactTriggerRef.current?.focus(); };
  }, [contactOpen]);

  const products = useMemo(() => {
    const term = search.trim().toLowerCase();
    return catalog.data?.products.filter((product) => {
      const matchesSearch = !term
        || product.name.toLowerCase().includes(term)
        || product.description?.toLowerCase().includes(term);
      const matchesCategory = category === 'all' || product.category?.id === category;
      return matchesSearch && matchesCategory;
    }) ?? [];
  }, [catalog.data?.products, category, search]);

  if (catalog.isLoading) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 dark:bg-slate-950"><div className="text-center"><div className="mx-auto size-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600 dark:border-slate-800 dark:border-t-violet-400" /><p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Opening shop…</p></div></main>;
  }
  if (catalog.isError || !catalog.data) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center dark:bg-slate-950">
        <div><PackageOpen className="mx-auto text-slate-400" size={44} /><h1 className="mt-4 text-2xl font-bold">Shop not found</h1><p className="mt-2 text-slate-500">This catalog may have moved or is unavailable.</p></div>
      </main>
    );
  }

  const { shop } = catalog.data;
  const hex = shop.primaryColor.replace('#', '');
  const red = Number.parseInt(hex.slice(0, 2), 16) / 255; const green = Number.parseInt(hex.slice(2, 4), 16) / 255; const blue = Number.parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue); const min = Math.min(red, green, blue); const delta = max - min;
  let hue = delta === 0 ? 0 : max === red ? ((green - blue) / delta) % 6 : max === green ? (blue - red) / delta + 2 : (red - green) / delta + 4;
  hue = Math.round(hue * 60); if (hue < 0) hue += 360;
  const lightness = (max + min) / 2; const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  const brandStyle = { '--primary': `${hue} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%` } as CSSProperties;
  const money = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: shop.currency,
    maximumFractionDigits: shop.currency === 'MMK' ? 0 : 2,
  });
  const contactPhone = shop.businessPhone || shop.phone;
  const telegramUrl = shop.telegramContact?.startsWith('@') ? `https://t.me/${shop.telegramContact.slice(1)}` : shop.telegramContact;
  const viberUrl = shop.viberContact && !shop.viberContact.startsWith('viber://')
    ? `viber://chat?number=${encodeURIComponent(shop.viberContact.replace(/^\+/, ''))}` : shop.viberContact;
  const contacts = [
    contactPhone && { label: 'Call seller', href: `tel:${contactPhone}`, icon: Phone, external: false },
    shop.messengerUrl && { label: 'Messenger', href: shop.messengerUrl, icon: MessageCircle, external: true },
    viberUrl && { label: 'Viber', href: viberUrl, icon: Phone, external: false },
    telegramUrl && { label: 'Telegram', href: telegramUrl, icon: Send, external: true },
    shop.businessEmail && { label: 'Email', href: `mailto:${shop.businessEmail}`, icon: Mail, external: false },
    shop.facebookPageUrl && { label: 'Facebook Page', href: shop.facebookPageUrl, icon: Facebook, external: true },
    shop.tiktokProfileUrl && { label: 'TikTok Profile', href: shop.tiktokProfileUrl, icon: Music2, external: true },
  ].filter(Boolean) as Array<{ label: string; href: string; icon: typeof Phone; external: boolean }>;

  return (
    <main style={brandStyle} className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800" style={{ backgroundImage: `radial-gradient(circle at top left, ${shop.primaryColor}${publicTheme === 'dark' ? '38' : '24'}, transparent 58%)` }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between md:px-8 md:py-12">
          <div className="flex items-center gap-4">
            {shop.shopLogo ? (
              <img className="h-20 w-20 rounded-3xl border-4 border-white object-cover shadow-md" src={shop.shopLogo} alt={`${shop.shopName} logo`} />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-3xl bg-primary text-3xl font-black text-white shadow-md">
                <span className="leading-none">{shop.shopName.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Climbio Shop</p>
              <h1 className="mt-1 text-3xl font-black md:text-4xl">{shop.shopName}</h1>
              {shop.shopAddress && <p className="mt-2 flex items-center gap-1 text-sm text-slate-600"><IconLabel icon={MapPin}>{shop.shopAddress}</IconLabel></p>}
            </div>
          </div>
          <div className="flex items-center gap-2"><button type="button" className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white/80 text-slate-700 shadow-sm backdrop-blur transition hover:border-primary dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200" onClick={() => setPublicTheme((current) => current === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${publicTheme === 'light' ? 'dark' : 'light'} mode`}>{publicTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button><button ref={contactTriggerRef} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" onClick={() => setContactOpen(true)}>
            <IconLabel icon={Phone}>Contact seller</IconLabel>
          </button></div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <section className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search products</span>
            <span className="input-icon-frame left-3 w-[18px]"><Search size={18} /></span>
            <input
              className="control bg-slate-50 pl-10"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              aria-label="Search products"
            />
          </label>
          <select className="control bg-slate-50 sm:w-52 sm:flex-none" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter products by category">
            <option value="all">All categories</option>
            {catalog.data.categories.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
        </section>

        <div className="mt-8 flex items-end justify-between">
          <div><h2 className="text-2xl font-bold">Products</h2><p className="mt-1 text-sm text-slate-500">{products.length} item{products.length === 1 ? '' : 's'} available</p></div>
        </div>

        {products.length === 0 ? (
          <div className="mt-8 grid min-h-72 place-items-center rounded-3xl border border-dashed bg-white text-center dark:border-slate-700 dark:bg-slate-900">
            <div><ShoppingBag className="mx-auto text-slate-300" size={42} /><p className="mt-3 font-semibold">No products found</p><p className="mt-1 text-sm text-slate-500">Try a different search or category.</p></div>
          </div>
        ) : (
          <section className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <button className="group overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:hover:border-violet-500" key={product.id} onClick={() => setSelected(product)}>
                <div className="relative aspect-square overflow-hidden bg-violet-50 dark:bg-violet-500/10">
                  {product.image ? (
                    <img className="h-full w-full object-cover transition duration-300 group-hover:scale-105" src={product.image} alt={product.name} loading="lazy" />
                  ) : (
                    <div className="grid h-full place-items-center text-primary/40"><ShoppingBag size={52} /></div>
                  )}
                  {product.quantity === 0 && <span className="absolute left-3 top-3 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">Out of Stock</span>}
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{product.category?.name ?? 'Uncategorized'}</p>
                  <h3 className="mt-1 line-clamp-2 min-h-12 text-lg font-bold">{product.name}</h3>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="font-black text-primary">{money.format(Number(product.price))}</span>
                    <span className={`text-xs font-semibold ${product.quantity === 0 ? 'text-red-600' : 'text-slate-500'}`}>
                      {product.quantity === 0 ? 'Unavailable' : `${product.quantity} in stock`}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </section>
        )}
      </div>

      <footer className="mt-10 border-t bg-white py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        {shop.shopName} · Powered by <span className="font-bold text-primary">Climbio</span>
      </footer>

      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:grid sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="contact-seller-title" onMouseDown={(event) => event.target === event.currentTarget && setContactOpen(false)}>
          <div className="w-full rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:max-w-md sm:rounded-3xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Contact seller</p><h2 id="contact-seller-title" className="mt-1 text-xl font-black">Contact {shop.shopName}</h2></div>
              <button ref={contactCloseRef} className="rounded-full bg-slate-100 p-2 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-slate-800 dark:hover:bg-slate-700" onClick={() => setContactOpen(false)} aria-label="Close contact options"><X size={18} /></button>
            </div>
            {contacts.length ? <div className="mt-5 grid gap-2">{contacts.map(({ label, href, icon: Icon, external }) => (
              <a key={label} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 font-semibold transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-700 dark:hover:border-violet-500 dark:hover:bg-violet-500/10" href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
                <Icon size={19} className="text-primary" /><span className="flex-1">{label}</span>{external && <ExternalLink size={15} className="text-slate-400" />}
              </a>
            ))}</div> : <p className="mt-5 rounded-xl bg-slate-100 p-4 text-sm text-slate-500 dark:bg-slate-800">No contact methods are available for this store.</p>}
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="grid md:grid-cols-2">
              <div className="aspect-square bg-violet-50 dark:bg-violet-500/10">
                {selected.image ? <img className="h-full w-full object-cover md:rounded-l-3xl" src={selected.image} alt={selected.name} /> : <div className="grid h-full place-items-center text-primary/40"><ShoppingBag size={64} /></div>}
              </div>
              <div className="relative p-6 md:p-8">
                <button className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700" onClick={() => setSelected(null)} aria-label="Close product details"><X size={18} /></button>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">{selected.category?.name ?? 'Uncategorized'}</p>
                <h2 className="mt-2 pr-8 text-2xl font-black">{selected.name}</h2>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{selected.description || 'No product description available.'}</p>
                <p className="mt-6 text-2xl font-black text-primary">{money.format(Number(selected.price))}</p>
                <p className={`mt-2 text-sm font-semibold ${selected.quantity === 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                  {selected.quantity === 0 ? 'Out of Stock' : `${selected.quantity} available`}
                </p>
                {shop.phone ? (
                  <a className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white hover:opacity-90" href={`tel:${shop.phone}`}>
                    <IconLabel icon={Phone}>Contact seller</IconLabel>
                  </a>
                ) : (
                  <p className="mt-7 rounded-xl bg-slate-100 p-3 text-center text-sm text-slate-500">Seller contact is unavailable.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
