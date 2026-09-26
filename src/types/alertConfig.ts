export interface AlertThresholdConfig {
  criticalThreshold: number; // e.g. breaches per minute or window
  warningThreshold: number;  // warning trigger threshold
  autoQuarantineOnCritical: boolean;
  sendPagerDutyAlert: boolean;
  notifyManagingPartner: boolean;
  blockCopilotTenantWide: boolean;
  alertEmailRecipient: string;
}

export const DEFAULT_ALERT_CONFIG: AlertThresholdConfig = {
  criticalThreshold: 3,
  warningThreshold: 5,
  autoQuarantineOnCritical: true,
  sendPagerDutyAlert: true,
  notifyManagingPartner: true,
  blockCopilotTenantWide: false,
  alertEmailRecipient: 'infosec-compliance@gtlaw.com'
};
