import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Boxes,
  EllipsisVertical,
  Grid2X2,
  List,
  PackageCheck,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { PageHeader } from '@/components/common/PageHeader';
import { IconLabel } from '@/components/ui/IconLabel';
import { inventoryService } from '@/services/inventoryService';
import { useAuthStore } from '@/store/authStore';
import type { Product, ProductInput } from '@/types/inventory';

type ViewMode = 'list' | 'grid';
type StockFilter = 'all' | 'in' | 'low' | 'out';
type SortOption = 'recent' | 'name-asc' | 'name-desc' | 'price-high' | 'price-low' | 'stock-high' | 'stock-low';

function stockState(quantity: number, lowStockThreshold: number) {
  if (quantity === 0) return { label: 'Out of Stock', className: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300' };
  if (quantity <= lowStockThreshold) return { label: 'Low Stock', className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' };
  return { label: 'In Stock', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' };
}

function ProductImage({ product, className }: { product: Product; className: string }) {
  return product.image ? (
    <img className={`${className} border border-slate-200 object-cover object-center dark:border-slate-700`} src={product.image} alt={product.name} loading="lazy" />
  ) : (
    <div className={`${className} grid shrink-0 place-items-center bg-violet-50 text-lg font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300`}>{product.name.charAt(0).toUpperCase()}</div>
  );
}

function ProductActions({ product, busy, onAdjustStock, onDelete }: {
  product: Product;
  busy: boolean;
  onAdjustStock: () => void;
  onDelete: () => void;
}) {
  const itemClass = 'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700';
  return (
    <details className="group relative">
      <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white" aria-label={`Actions for ${product.name}`}>
        <EllipsisVertical className="size-4" />
      </summary>
      <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <a className={itemClass} href={`/products/${product.id}/edit`}><IconLabel icon={Pencil}>Edit product</IconLabel></a>
        <button className={itemClass} type="button" disabled={busy} onClick={onAdjustStock}><IconLabel icon={SlidersHorizontal}>Adjust stock</IconLabel></button>
        <button className={`${itemClass} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10`} type="button" disabled={busy} onClick={onDelete}><IconLabel icon={Trash2}>Delete product</IconLabel></button>
      </div>
    </details>
  );
}

export function ProductList() {
  const queryClient = useQueryClient();
  const currency = useAuthStore((state) => state.user?.setting?.currency ?? 'MMK');
  const products = useQuery({ queryKey: ['products'], queryFn: inventoryService.listProducts });
  const categories = useQuery({ queryKey: ['categories'], queryFn: inventoryService.listCategories });
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sort, setSort] = useState<SortOption>('recent');
  const [view, setView] = useState<ViewMode>(() => localStorage.getItem('climbio-product-view') === 'grid' ? 'grid' : 'list');
  const [lowStockThreshold, setLowStockThreshold] = useState(() => {
    const saved = Number(localStorage.getItem('climbio-low-stock-threshold'));
    return Number.isInteger(saved) && saved >= 1 ? saved : 5;
  });
  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency });

  const refreshProducts = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['products'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['my-public-store'] }),
    ]);
  };
  const removeProduct = useMutation({ mutationFn: inventoryService.deleteProduct, onSuccess: refreshProducts });
  const adjustStock = useMutation({
    mutationFn: ({ product, quantity }: { product: Product; quantity: number }) => inventoryService.updateProduct(product.id, {
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      costPrice: product.costPrice,
      quantity: String(quantity),
      categoryId: product.categoryId ?? '',
    }),
    onSuccess: refreshProducts,
  });

  const summary = useMemo(() => {
    const data = products.data ?? [];
    return {
      products: data.length,
      stock: data.reduce((total, product) => total + product.quantity, 0),
      low: data.filter((product) => product.quantity > 0 && product.quantity <= lowStockThreshold).length,
      out: data.filter((product) => product.quantity === 0).length,
    };
  }, [lowStockThreshold, products.data]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...(products.data ?? [])].filter((product) => {
      const matchesSearch = !term || product.name.toLowerCase().includes(term) || (product.category?.name ?? '').toLowerCase().includes(term);
      const matchesCategory = categoryId === 'all' || product.categoryId === categoryId;
      const matchesStock = stockFilter === 'all'
        || (stockFilter === 'out' && product.quantity === 0)
        || (stockFilter === 'low' && product.quantity > 0 && product.quantity <= lowStockThreshold)
        || (stockFilter === 'in' && product.quantity > lowStockThreshold);
      return matchesSearch && matchesCategory && matchesStock;
    }).sort((left, right) => {
      if (sort === 'name-asc') return left.name.localeCompare(right.name);
      if (sort === 'name-desc') return right.name.localeCompare(left.name);
      if (sort === 'price-high') return Number(right.price) - Number(left.price);
      if (sort === 'price-low') return Number(left.price) - Number(right.price);
      if (sort === 'stock-high') return right.quantity - left.quantity;
      if (sort === 'stock-low') return left.quantity - right.quantity;
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }, [categoryId, lowStockThreshold, products.data, search, sort, stockFilter]);

  const changeView = (nextView: ViewMode) => {
    setView(nextView);
    localStorage.setItem('climbio-product-view', nextView);
  };
  const changeThreshold = (value: number) => {
    const threshold = Math.max(1, Math.min(999999, Math.round(value || 1)));
    setLowStockThreshold(threshold);
    localStorage.setItem('climbio-low-stock-threshold', String(threshold));
  };
  const handleDelete = (product: Product) => {
    if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) removeProduct.mutate(product.id);
  };
  const handleAdjustStock = (product: Product) => {
    const value = window.prompt(`Set stock quantity for "${product.name}":`, String(product.quantity));
    if (value === null) return;
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 0) {
      window.alert('Stock quantity must be a whole number of zero or more.');
      return;
    }
    adjustStock.mutate({ product, quantity });
  };
  const busy = removeProduct.isPending || adjustStock.isPending;
  const hasFilters = search || categoryId !== 'all' || stockFilter !== 'all';
  const clearFilters = () => { setSearch(''); setCategoryId('all'); setStockFilter('all'); };

  return (
    <main className="page-container">
      <PageHeader
        eyebrow="Product management"
        title="Inventory"
        description="Manage products, prices, visibility, and stock in one place."
        actions={<a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-violet-700" href="/products/new"><IconLabel icon={Plus}>Add product</IconLabel></a>}
      />

      {products.isError && <Alert className="mt-6" tone="error">Could not load inventory. Please refresh and try again.</Alert>}
      {(removeProduct.isError || adjustStock.isError) && <Alert className="mt-6" tone="error">The product action could not be completed. Please try again.</Alert>}

      {!products.isLoading && !products.isError && (
        <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Inventory summary">
          {[
            { label: 'Total products', value: summary.products, icon: Boxes, tone: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300' },
            { label: 'Total stock quantity', value: summary.stock, icon: PackageCheck, tone: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300' },
            { label: 'Low stock items', value: summary.low, icon: TriangleAlert, tone: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300' },
            { label: 'Out of stock items', value: summary.out, icon: PackageOpen, tone: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300' },
          ].map(({ label, value, icon: Icon, tone }) => (
            <Card className="flex items-center gap-3 p-4" key={label}>
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span>
              <span><span className="block text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span><strong className="mt-1 block text-lg">{value.toLocaleString()}</strong></span>
            </Card>
          ))}
        </section>
      )}

      <Card className="mt-6 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative block h-11 min-w-0 md:col-span-2 xl:col-span-1">
            <span className="sr-only">Search products</span><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input className="control pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." />
          </label>
          <div><select className="control" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} aria-label="Filter by category"><option value="all">All categories</option>{categories.data?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
          <div><select className="control" value={stockFilter} onChange={(event) => setStockFilter(event.target.value as StockFilter)} aria-label="Filter by stock"><option value="all">All stock</option><option value="in">In Stock</option><option value="low">Low Stock</option><option value="out">Out of Stock</option></select></div>
          <div><select className="control" value={sort} onChange={(event) => setSort(event.target.value as SortOption)} aria-label="Sort products"><option value="recent">Recently added</option><option value="name-asc">Product name A–Z</option><option value="name-desc">Product name Z–A</option><option value="price-high">Highest price</option><option value="price-low">Lowest price</option><option value="stock-high">Highest stock</option><option value="stock-low">Lowest stock</option></select></div>
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
          <label className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">Low stock threshold <span className="block w-20"><input className="control min-h-9 py-1 text-center" type="number" min="1" max="999999" value={lowStockThreshold} onChange={(event) => changeThreshold(Number(event.target.value))} /></span></label>
          <div className="inline-flex w-fit rounded-xl bg-slate-100 p-1 dark:bg-slate-800" aria-label="Product view">
            <button type="button" className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${view === 'list' ? 'bg-white text-violet-600 shadow-sm dark:bg-slate-700 dark:text-violet-300' : 'text-slate-500'}`} onClick={() => changeView('list')}><IconLabel icon={List}>List</IconLabel></button>
            <button type="button" className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${view === 'grid' ? 'bg-white text-violet-600 shadow-sm dark:bg-slate-700 dark:text-violet-300' : 'text-slate-500'}`} onClick={() => changeView('grid')}><IconLabel icon={Grid2X2}>Grid</IconLabel></button>
          </div>
        </div>
      </Card>

      {products.isLoading && <Card className="mt-4 p-0"><LoadingState label="Loading products" rows={5} /></Card>}
      {products.data?.length === 0 && <Card className="mt-4 p-0"><EmptyState icon={<PackageOpen className="size-6" />} title="Your inventory is empty" description="Add your first product to start tracking stock and building your public catalog." action={<a className="font-semibold text-primary hover:underline" href="/products/new">Add your first product</a>} /></Card>}
      {!!products.data?.length && filteredProducts.length === 0 && <Card className="mt-4 p-0"><EmptyState icon={<Search className="size-6" />} title="No matching products" description="Try changing your search or inventory filters." action={hasFilters ? <button className="font-semibold text-primary hover:underline" onClick={clearFilters}>Clear all filters</button> : undefined} /></Card>}

      {filteredProducts.length > 0 && view === 'grid' && (
        <section className="mt-4 grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const stock = stockState(product.quantity, lowStockThreshold);
            return (
              <Card className="flex h-full flex-col overflow-visible p-0" key={product.id}>
                <div className="relative h-56 overflow-hidden rounded-t-2xl bg-slate-100 dark:bg-slate-800"><ProductImage product={product} className="h-full w-full rounded-t-2xl" /><div className="absolute right-3 top-3"><Badge className={stock.className}>{stock.label}</Badge></div></div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h2 className="truncate font-bold">{product.name}</h2><p className="mt-1 text-xs text-slate-500">{product.category?.name ?? 'Uncategorized'}</p></div><ProductActions product={product} busy={busy} onAdjustStock={() => handleAdjustStock(product)} onDelete={() => handleDelete(product)} /></div>
                  <div className="mt-auto grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 text-sm dark:border-slate-700"><div><p className="text-xs text-slate-500">Selling price</p><p className="mt-1 font-semibold">{money.format(Number(product.price))}</p></div><div><p className="text-xs text-slate-500">Cost price</p><p className="mt-1 font-semibold">{money.format(Number(product.costPrice))}</p></div></div>
                  <p className="mt-3 text-sm"><span className="text-slate-500">Stock quantity:</span> <strong>{product.quantity}</strong></p>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      {filteredProducts.length > 0 && view === 'list' && (
        <Card className="mt-4 overflow-visible p-0">
          <div className="divide-y dark:divide-slate-800 sm:hidden">
            {filteredProducts.map((product) => {
              const stock = stockState(product.quantity, lowStockThreshold);
              return <article className="p-4" key={product.id}><div className="flex gap-3"><ProductImage product={product} className="size-16 rounded-xl" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h2 className="truncate font-semibold">{product.name}</h2><p className="text-xs text-slate-500">{product.category?.name ?? 'Uncategorized'}</p></div><ProductActions product={product} busy={busy} onAdjustStock={() => handleAdjustStock(product)} onDelete={() => handleDelete(product)} /></div><div className="mt-3 flex items-center justify-between"><div><p className="font-semibold">{money.format(Number(product.price))}</p><p className="text-xs text-slate-500">Cost {money.format(Number(product.costPrice))}</p></div><div className="text-right"><Badge className={stock.className}>{stock.label}</Badge><p className="mt-1 text-xs text-slate-500">Qty {product.quantity}</p></div></div></div></div></article>;
            })}
          </div>
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[920px] text-left">
              <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400"><tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Selling price</th><th className="px-5 py-4">Cost price</th><th className="px-5 py-4">Quantity</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y dark:divide-slate-800">
                {filteredProducts.map((product) => { const stock = stockState(product.quantity, lowStockThreshold); return (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50"><td className="px-5 py-4"><div className="flex items-center gap-3"><ProductImage product={product} className="size-12 rounded-xl" /><div><p className="font-semibold">{product.name}</p><p className="max-w-52 truncate text-xs text-slate-500">{product.description || 'No description'}</p></div></div></td><td className="px-5 py-4 text-sm">{product.category?.name ?? 'Uncategorized'}</td><td className="px-5 py-4 font-semibold">{money.format(Number(product.price))}</td><td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{money.format(Number(product.costPrice))}</td><td className="px-5 py-4 font-semibold">{product.quantity}</td><td className="px-5 py-4"><Badge className={stock.className}>{stock.label}</Badge></td><td className="px-5 py-4"><div className="flex justify-end"><ProductActions product={product} busy={busy} onAdjustStock={() => handleAdjustStock(product)} onDelete={() => handleDelete(product)} /></div></td></tr>
                ); })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </main>
  );
}
