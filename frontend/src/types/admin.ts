import type { AccountStatus, Role, ShopApprovalStatus } from './auth';

export type ReviewAction = 'APPROVE' | 'REQUEST_CHANGES' | 'DECLINE' | 'SUSPEND' | 'REACTIVATE' | 'GENERAL_FEEDBACK' | 'REOPEN';
export type ApplicationReviewAction = Extract<ReviewAction, 'APPROVE' | 'REQUEST_CHANGES' | 'DECLINE'>;
export type ShopManagementAction = Extract<ReviewAction, 'SUSPEND' | 'REACTIVATE'>;

export interface AdminShop {
  id: string; email: string; name: string; shopName: string; phone: string | null; shopLogo: string | null; shopAddress: string | null;
  businessCategory: string | null; businessDescription: string | null; businessPhone: string | null; businessEmail: string | null; cityTownship: string | null; ownerRole: string | null; businessRegistrationNumber: string | null; verificationDocument: string | null; websiteUrl: string | null;
  role: Role; accountStatus: AccountStatus; approvalStatus: ShopApprovalStatus; submittedAt: string; approvedAt: string | null; suspendedAt: string | null; applicationVersion: number; createdAt: string;
}
export interface Review { id: string; action: string; previousStatus: ShopApprovalStatus | null; nextStatus: ShopApprovalStatus | null; feedback: string | null; version: number; createdAt: string; admin: { id: string; name: string; email: string } | null; }
export interface ApplicationDetail extends AdminShop { reviewsReceived: Review[]; }
export interface Paged<T> { items: T[]; total: number; page: number; pageSize: number; }
export interface AdminDashboard { counts: Record<'pending' | 'approved' | 'changesRequested' | 'declined' | 'suspended', number>; recentApplications: AdminShop[]; recentActivity: Array<{ id: string; action: string; feedback: string | null; createdAt: string; shop: Pick<AdminShop, 'id' | 'shopName'>; admin: { name: string } | null }>; }
