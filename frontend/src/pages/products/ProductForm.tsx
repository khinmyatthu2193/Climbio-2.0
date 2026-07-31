import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/Alert';
import { PageHeader } from '@/components/common/PageHeader';
import { inventoryService } from '@/services/inventoryService';
import type { ProductInput } from '@/types/inventory';

const emptyForm: ProductInput = {
  name: '',
  description: '',
  price: '',
  costPrice: '',
  quantity: '0',
  categoryId: '',
};

function errorMessage(error: unknown) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error ?? 'Could not reach the inventory service.';
  }
  return 'Could not save the product. Check all fields and try again.';
}

export function ProductForm({ productId }: { productId?: string }) {
  const editing = Boolean(productId);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [categoryName, setCategoryName] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const product = useQuery({
    queryKey: ['products', productId],
    queryFn: () => inventoryService.getProduct(productId!),
    enabled: editing,
  });
  const categories = useQuery({ queryKey: ['categories'], queryFn: inventoryService.listCategories });

  useEffect(() => {
    if (!product.data) return;
    setForm({
      name: product.data.name,
      description: product.data.description ?? '',
      price: product.data.price,
      costPrice: product.data.costPrice,
      quantity: String(product.data.quantity),
      categoryId: product.data.categoryId ?? '',
    });
    setPreview(product.data.image);
  }, [product.data]);

  useEffect(() => () => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
  }, [preview]);

  const save = useMutation({
    mutationFn: (input: ProductInput) =>
      editing ? inventoryService.updateProduct(productId!, input) : inventoryService.createProduct(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      window.location.assign('/products');
    },
  });
  const addCategory = useMutation({
    mutationFn: inventoryService.createCategory,
    onSuccess: async (created) => {
      setCategoryName('');
      setForm((current) => ({ ...current, categoryId: created.id }));
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const update = (field: keyof ProductInput, value: string | File) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate(form);
  };

  if (editing && product.isLoading) {
    return <main className="page-container"><Card className="animate-pulse text-slate-500">Loading product…</Card></main>;
  }

  return (
    <main className="page-container">
      <div className="max-w-3xl">
        <PageHeader eyebrow="Inventory" title={editing ? 'Edit product' : 'Add product'} description={editing ? 'Update product details, pricing, and stock.' : 'Add a new item to your inventory and public catalog.'} />

        {product.isError ? (
          <Alert className="mt-6" tone="error">Product could not be loaded.</Alert>
        ) : (
          <form className="mt-6 space-y-6" onSubmit={submit}>
            <Card>
              <h2 className="mb-4 text-lg font-bold">Product details</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="mb-1 block text-sm font-medium">Name</span>
                  <Input value={form.name} onChange={(event) => update('name', event.target.value)} maxLength={100} required />
                </label>
                <label className="md:col-span-2">
                  <span className="mb-1 block text-sm font-medium">Description</span>
                  <textarea
                    className="control min-h-28 resize-y"
                    value={form.description}
                    onChange={(event) => update('description', event.target.value)}
                    maxLength={2000}
                  />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium">Selling price</span>
                  <Input type="number" min="0" step="0.01" value={form.price} onChange={(event) => update('price', event.target.value)} required />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium">Cost price</span>
                  <Input type="number" min="0" step="0.01" value={form.costPrice} onChange={(event) => update('costPrice', event.target.value)} required />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium">Stock quantity</span>
                  <Input type="number" min="0" step="1" value={form.quantity} onChange={(event) => update('quantity', event.target.value)} required />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium">Category</span>
                  <select
                    className="control"
                    value={form.categoryId}
                    onChange={(event) => update('categoryId', event.target.value)}
                  >
                    <option value="">Uncategorized</option>
                    {categories.data?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </label>
              </div>
              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="New category name"
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  maxLength={100}
                />
                <Button
                  type="button"
                  className="shrink-0"
                  disabled={!categoryName.trim() || addCategory.isPending}
                  onClick={() => addCategory.mutate(categoryName)}
                >
                  Add category
                </Button>
              </div>
              {addCategory.isError && <p className="mt-2 text-sm text-red-600">Could not add category. The name may already exist.</p>}
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-bold">Product image</h2>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {preview ? (
                  <img className="h-28 w-28 rounded-2xl border object-cover" src={preview} alt="Product preview" />
                ) : (
                  <div className="grid h-28 w-28 place-items-center rounded-2xl border bg-violet-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-violet-500/10 dark:text-slate-400">No image</div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) {
                        event.target.value = '';
                        window.alert('Image must be 2 MB or smaller.');
                        return;
                      }
                      update('image', file);
                      setPreview(URL.createObjectURL(file));
                    }}
                  />
                  <p className="mt-2 text-xs text-slate-500">JPG, PNG, or WebP. Maximum 2 MB.</p>
                </div>
              </div>
            </Card>

            {save.isError && <Alert tone="error">{errorMessage(save.error)}</Alert>}
            <div className="flex justify-end gap-3">
              <a className="rounded-xl border px-4 py-2 font-medium hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800" href="/products">Cancel</a>
              <Button disabled={save.isPending}>{save.isPending ? 'Saving…' : editing ? 'Save changes' : 'Add product'}</Button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
