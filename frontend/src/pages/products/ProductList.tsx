import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/common/Card';
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

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) removeProduct.mutate(id);
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a className="text-sm font-semibold text-primary hover:underline" href="/">← Dashboard</a>
            <h1 className="mt-2 text-3xl font-bold">Inventory</h1>
            <p className="mt-1 text-slate-600">Manage products, prices, and stock in one place.</p>
          </div>
          <a className="rounded-lg bg-primary px-4 py-2 text-center font-medium text-primary-foreground hover:opacity-90" href="/products/new">
            Add product
          </a>
        </header>

        <Card className="mt-8 overflow-hidden p-0">
          {products.isLoading && <p className="p-6 text-slate-600">Loading products…</p>}
          {products.isError && <p className="p-6 text-red-600">Could not load inventory. Please try again.</p>}
          {products.data?.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-lg font-semibold">Your inventory is empty</p>
              <p className="mt-1 text-sm text-slate-500">Add your first product to start tracking stock.</p>
            </div>
          )}
          {!!products.data?.length && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b bg-emerald-50/60 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.data.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img className="h-12 w-12 rounded-xl border object-cover" src={product.image} alt="" />
                          ) : (
                            <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 font-bold text-primary">
                              {product.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="max-w-64 truncate text-sm text-slate-500">{product.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm">{product.category?.name ?? 'Uncategorized'}</td>
                      <td className="px-5 py-4 font-medium">
                        {new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(product.price))}
                      </td>
                      <td className="px-5 py-4">
                        <span className={product.quantity <= 5 ? 'font-semibold text-amber-700' : ''}>{product.quantity}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <a className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50" href={`/products/${product.id}/edit`}>Edit</a>
                          <Button
                            className="bg-red-600 px-3 py-2 text-sm"
                            disabled={removeProduct.isPending}
                            onClick={() => handleDelete(product.id, product.name)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        {removeProduct.isError && <p className="mt-3 text-sm text-red-600">Could not delete the product.</p>}
      </div>
    </main>
  );
}
