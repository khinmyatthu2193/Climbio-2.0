import type { AccountStatus, ShopApprovalStatus } from './auth';
import type { Review } from './admin';

export interface ShopApplication {
  id: string; email: string; name: string; shopName: string; phone: string | null; shopLogo: string | null; shopAddress: string | null;
  businessCategory: string | null; businessDescription: string | null; businessPhone: string | null; businessEmail: string | null; cityTownship: string | null;
  ownerRole: string | null; businessRegistrationNumber: string | null; verificationDocument: string | null; websiteUrl: string | null;
  accountStatus: AccountStatus; approvalStatus: ShopApprovalStatus; submittedAt: string | null; approvedAt: string | null; suspendedAt: string | null; applicationVersion: number; reviewsReceived: Review[];
}
