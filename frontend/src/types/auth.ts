export type Role = 'ADMIN' | 'SHOP_OWNER' | 'MANAGER' | 'STAFF';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
export type ShopApprovalStatus = 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'DECLINED' | 'SUSPENDED';
export type Currency = 'MMK' | 'USD' | 'THB';
export type InvoiceWatermarkType = 'NONE' | 'LOGO' | 'EMOJI' | 'IMAGE';

export interface ShopSetting {
  currency: Currency;
  invoiceFooter: string | null;
  invoiceThemeColor: string;
  watermarkType: InvoiceWatermarkType;
  watermarkImageUrl: string | null;
  watermarkEmoji: string | null;
  watermarkOpacity: number;
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
  accountStatus: AccountStatus;
  approvalStatus: ShopApprovalStatus;
  submittedAt: string | null;
  approvedAt: string | null;
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
  invoiceThemeColor: string;
  watermarkType: InvoiceWatermarkType;
  watermarkEmoji: string | null;
  watermarkOpacity: number;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
