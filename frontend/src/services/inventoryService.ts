import { api } from './api';
import type { Category, Product, ProductInput } from '@/types/inventory';

function productFormData(input: ProductInput) {
  const data = new FormData();
  data.append('name', input.name);
  data.append('description', input.description);
  data.append('price', input.price);
  data.append('costPrice', input.costPrice);
  data.append('quantity', input.quantity);
  data.append('categoryId', input.categoryId);
  if (input.image) data.append('image', input.image);
  return data;
}

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const inventoryService = {
  listProducts: () => api.get<Product[]>('/products').then((response) => response.data),
  getProduct: (id: string) => api.get<Product>(`/products/${id}`).then((response) => response.data),
  createProduct: (input: ProductInput) =>
    api.post<Product>('/products', productFormData(input), multipart).then((response) => response.data),
  updateProduct: (id: string, input: ProductInput) =>
    api.put<Product>(`/products/${id}`, productFormData(input), multipart).then((response) => response.data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  listCategories: () => api.get<Category[]>('/categories').then((response) => response.data),
  createCategory: (name: string) =>
    api.post<Category>('/categories', { name }).then((response) => response.data),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
};
