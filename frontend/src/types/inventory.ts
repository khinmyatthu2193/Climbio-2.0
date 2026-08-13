export interface Category {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  image: string | null;
  price: string;
  costPrice: string;
  quantity: number;
  isActive: boolean;
  categoryId: string | null;
  category: Pick<Category, 'id' | 'name'> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: string;
  costPrice: string;
  quantity: string;
  isActive: boolean;
  categoryId: string;
  image?: File;
}
