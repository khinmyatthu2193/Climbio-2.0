export type Role = 'ADMIN' | 'MANAGER' | 'STAFF';
export type Currency = 'MMK' | 'USD' | 'THB';

export interface ShopSetting {
  currency: Currency;
  invoiceFooter: string | null;
  companyName: string | null;
  companyLogo: string | null;
  theme: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  shopName: string;
  phone: string | null;
  shopLogo: string | null;
  shopAddress: string | null;
  role: Role;
  setting: ShopSetting | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface UpdateProfileInput {
  name: string;
  shopName: string;
  phone: string | null;
  shopAddress: string | null;
  currency: Currency;
  invoiceFooter: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
