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
