export interface ApprovalNotificationEvent {
  shopId: string;
  action: string;
}

// Extension point for a future email or push provider. Workflow transactions never wait on delivery.
export const approvalNotificationService = {
  notify: async (_event: ApprovalNotificationEvent) => undefined,
};
