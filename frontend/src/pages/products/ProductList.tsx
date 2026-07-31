import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PackageOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { PageHeader } from '@/components/common/PageHeader';
import { inventoryService } from '@/services/inventoryService';
import { useAuthStore } from '@/store/authStore';

export function ProductList() {
  const queryClient = useQueryClient();
  const currency = useAuthStore((state) => state.user?.setting?.currency ?? 'MMK');
  const products = useQuery({ queryKey: ['products'], queryFn: inventoryService.listProducts });
  const removeProduct = useMutation({
    mutationFn: inventoryService.deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) removeProduct.mutate(id);
  };

  return (
    <main className="page-container">
      <PageHeader
        eyebrow="Product management"
        title="Inventory"
        description="Manage products, prices, visibility, and stock in one place."
        actions={<a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-violet-700" href="/products/new"><Plus className="size-4" /> Add product</a>}
      />

      {products.isError && <Alert className="mt-6" tone="error">Could not load inventory. Please refresh and try again.</Alert>}
      <Card className="mt-6 overflow-hidden p-0">
        {products.isLoading && <LoadingState label="Loading products" rows={5} />}
        {products.data?.length === 0 && (
          <EmptyState
            icon={<PackageOpen className="size-6" />}
            title="Your inventory is empty"
            description="Add your first product to start tracking stock and building your public catalog."
            action={<a className="font-semibold text-primary hover:underline" href="/products/new">Add your first product</a>}
          />
        )}
        {!!products.data?.length && (
          <>
            <div className="divide-y sm:hidden">
              {products.data.map((product) => (
                <article className="p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50" key={product.id}>
                  <div className="flex gap-3">
                    {product.image ? <img className="size-16 rounded-xl border object-cover" src={product.image} alt="" /> :
                      <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-violet-50 font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{product.name.charAt(0).toUpperCase()}</div>}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="truncate font-semibold">{product.name}</h2>
                        <Badge className={product.quantity === 0 ? 'bg-red-50 text-red-700' : product.quantity <= 5 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}>
                          {product.quantity === 0 ? 'Out of stock' : `${product.quantity} in stock`}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{product.category?.name ?? 'Uncategorized'}</p>
                      <p className="mt-2 font-semibold">{money.format(Number(product.price))}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <a className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200" href={`/products/${product.id}/edit`}><Pencil className="size-4" /> Edit</a>
                    <Button size="sm" variant="danger" disabled={removeProduct.isPending} onClick={() => handleDelete(product.id, product.name)}><Trash2 className="size-4" /> Delete</Button>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400">
                  <tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Stock</th><th className="px-5 py-4 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y">
                  {products.data.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {product.image ? <img className="size-12 rounded-xl border object-cover" src={product.image} alt="" /> :
                            <div className="grid size-12 place-items-center rounded-xl bg-violet-50 font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{product.name.charAt(0).toUpperCase()}</div>}
                          <div><p className="font-semibold">{product.name}</p><p className="max-w-64 truncate text-sm text-slate-500 dark:text-slate-400">{product.description || 'No description'}</p></div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm">{product.category?.name ?? 'Uncategorized'}</td>
                      <td className="px-5 py-4 font-medium">{money.format(Number(product.price))}</td>
                      <td className="px-5 py-4"><Badge className={product.quantity <= 5 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}>{product.quantity}</Badge></td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-2">
                        <a className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" href={`/products/${product.id}/edit`}>Edit</a>
                        <Button variant="danger" size="sm" disabled={removeProduct.isPending} onClick={() => handleDelete(product.id, product.name)}>Delete</Button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
      {removeProduct.isError && <Alert className="mt-3" tone="error">Could not delete the product.</Alert>}
    </main>
  );
}
