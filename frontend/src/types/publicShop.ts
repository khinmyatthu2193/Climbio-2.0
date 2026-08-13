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
    businessPhone: string | null;
    businessEmail: string | null;
    facebookPageUrl: string | null;
    messengerUrl: string | null;
    viberContact: string | null;
    telegramContact: string | null;
    tiktokProfileUrl: string | null;
    currency: 'MMK' | 'USD' | 'THB';
    primaryColor: string;
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
    businessPhone: string | null;
    businessEmail: string | null;
    facebookPageUrl: string | null;
    messengerUrl: string | null;
    viberContact: string | null;
    telegramContact: string | null;
    tiktokProfileUrl: string | null;
    createdAt: string;
  };
}

export interface UpdatePublicStoreInput {
  shopName: string;
  phone: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
  facebookPageUrl: string | null;
  messengerUrl: string | null;
  viberContact: string | null;
  telegramContact: string | null;
  tiktokProfileUrl: string | null;
  shopAddress: string | null;
}
