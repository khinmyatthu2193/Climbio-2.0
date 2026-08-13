export interface PublicShopProduct {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  price: string;
  quantity: number;
  category: { id: string; name: string } | null;
}

export interface PublicShopResponse {
  canonicalSlug: string;
  shop: {
    slug: string;
    shopName: string;
    shopLogo: string | null;
    shopAddress: string | null;
    phone: string | null;
    currency: 'MMK' | 'USD' | 'THB';
  };
  categories: Array<{ id: string; name: string }>;
  products: PublicShopProduct[];
}

export interface MyPublicStore {
  slug: string;
  publicUrl: string;
  publicEnabled: boolean;
  productCount: number;
  shopInfo: {
    shopName: string;
    shopLogo: string | null;
    shopAddress: string | null;
    phone: string | null;
    createdAt: string;
  };
}

export interface UpdatePublicStoreInput {
  slug: string;
  shopName: string;
  phone: string | null;
  shopAddress: string | null;
}
