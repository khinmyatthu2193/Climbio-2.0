import type { AccountStatus, ShopApprovalStatus } from './auth';
import type { Review } from './admin';

export interface ShopApplication {
  id: string; email: string; name: string; shopName: string; phone: string | null; shopLogo: string | null; shopAddress: string | null;
  accountStatus: AccountStatus; approvalStatus: ShopApprovalStatus; submittedAt: string; approvedAt: string | null; suspendedAt: string | null; applicationVersion: number; reviewsReceived: Review[];
}
