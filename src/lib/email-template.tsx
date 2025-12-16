export function getResetPasswordEmailHtml(
  email: string,
  resetUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #18181b;">Reset Your Password</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #52525b;">
                    Hi there,
                  </p>
                  <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #52525b;">
                    We received a request to reset the password for your account (<strong>${email}</strong>).
                  </p>
                  <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 24px; color: #52525b;">
                    Click the button below to reset your password:
                  </p>
                  
                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 30px 0;">
                        <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">Reset Password</a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 20px; color: #71717a;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0 0 30px 0; font-size: 14px; line-height: 20px; color: #3b82f6; word-break: break-all;">
                    ${resetUrl}
                  </p>
                  
                  <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 20px; color: #71717a;">
                    This link will expire in 1 hour for security reasons.
                  </p>
                  <p style="margin: 0; font-size: 14px; line-height: 20px; color: #71717a;">
                    If you didn't request a password reset, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px 40px 40px; border-top: 1px solid #e4e4e7;">
                  <p style="margin: 0; font-size: 12px; line-height: 18px; color: #a1a1aa; text-align: center;">
                    This is an automated message, please do not reply to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `.trim();
}

// ============================================================================
// PROVIDER STATUS EMAIL TEMPLATES
// ============================================================================

export type ProviderStatusEmailType =
  | "VERIFIED"
  | "REJECTED"
  | "SUSPENDED"
  | "PENDING";

interface ProviderStatusEmailOptions {
  providerName: string;
  healthcareName: string;
  status: ProviderStatusEmailType;
  reason?: string;
  dashboardUrl: string;
}

export function getProviderStatusEmailHtml(
  options: ProviderStatusEmailOptions
): string {
  const { providerName, healthcareName, status, reason, dashboardUrl } =
    options;

  const statusConfig: Record<
    ProviderStatusEmailType,
    {
      title: string;
      headerBgColor: string;
      headerTextColor: string;
      icon: string;
      heading: string;
      message: string;
      showButton: boolean;
      buttonText?: string;
    }
  > = {
    VERIFIED: {
      title: "Provider Account Verified",
      headerBgColor: "#10b981",
      headerTextColor: "#ffffff",
      icon: "✓",
      heading: "Congratulations! Your Account is Verified",
      message: `Great news! Your healthcare provider account for <strong>${healthcareName}</strong> has been verified by our team. You can now start receiving appointments from patients.`,
      showButton: true,
      buttonText: "Go to Dashboard",
    },
    REJECTED: {
      title: "Provider Application Update",
      headerBgColor: "#ef4444",
      headerTextColor: "#ffffff",
      icon: "✕",
      heading: "Application Not Approved",
      message: `We regret to inform you that your provider application for <strong>${healthcareName}</strong> has not been approved at this time.`,
      showButton: true,
      buttonText: "View Details",
    },
    SUSPENDED: {
      title: "Provider Account Suspended",
      headerBgColor: "#f59e0b",
      headerTextColor: "#ffffff",
      icon: "!",
      heading: "Account Suspended",
      message: `Your healthcare provider account for <strong>${healthcareName}</strong> has been temporarily suspended.`,
      showButton: true,
      buttonText: "Contact Support",
    },
    PENDING: {
      title: "Provider Status Updated",
      headerBgColor: "#6b7280",
      headerTextColor: "#ffffff",
      icon: "↻",
      heading: "Account Under Review",
      message: `Your provider account for <strong>${healthcareName}</strong> has been set to pending review status.`,
      showButton: true,
      buttonText: "View Status",
    },
  };

  const config = statusConfig[status];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
              <!-- Status Header -->
              <tr>
                <td style="padding: 30px; background-color: ${config.headerBgColor}; text-align: center;">
                  <div style="width: 60px; height: 60px; margin: 0 auto 15px auto; background-color: rgba(255,255,255,0.2); border-radius: 50%; line-height: 60px; font-size: 28px; color: ${config.headerTextColor};">
                    ${config.icon}
                  </div>
                  <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: ${config.headerTextColor};">${config.heading}</h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #52525b;">
                    Hi ${providerName},
                  </p>
                  <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #52525b;">
                    ${config.message}
                  </p>

                  ${
                    reason
                      ? `
                  <!-- Reason Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                    <tr>
                      <td style="padding: 16px 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 6px 6px 0;">
                        <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: 600; color: #92400e;">Reason:</p>
                        <p style="margin: 0; font-size: 14px; line-height: 20px; color: #78350f;">${reason}</p>
                      </td>
                    </tr>
                  </table>
                  `
                      : ""
                  }

                  ${
                    status === "VERIFIED"
                      ? `
                  <!-- What's Next Section -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                    <tr>
                      <td style="padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
                        <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #166534;">What's next?</p>
                        <ul style="margin: 0; padding-left: 20px; color: #166534; font-size: 14px; line-height: 22px;">
                          <li>Complete your profile with accurate information</li>
                          <li>Add your services and pricing</li>
                          <li>Set your operating hours</li>
                          <li>Start receiving appointment requests</li>
                        </ul>
                      </td>
                    </tr>
                  </table>
                  `
                      : ""
                  }

                  ${
                    config.showButton
                      ? `
                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">${config.buttonText}</a>
                      </td>
                    </tr>
                  </table>
                  `
                      : ""
                  }

                  <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 20px; color: #71717a;">
                    If you have any questions, please don't hesitate to contact our support team.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; border-top: 1px solid #e4e4e7; background-color: #fafafa;">
                  <p style="margin: 0; font-size: 12px; line-height: 18px; color: #a1a1aa; text-align: center;">
                    This is an automated message from Himsog Healthcare Platform. Please do not reply to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `.trim();
}

// ============================================================================
// APPOINTMENT EMAIL TEMPLATES
// ============================================================================

export interface AppointmentEmailOptions {
  patientName: string;
  patientEmail: string;
  providerName: string;
  providerAddress: string;
  appointmentNumber: string;
  appointmentDate: string; // Formatted date string (e.g., "December 20, 2024")
  appointmentTime: string; // Formatted time string (e.g., "10:00 AM")
  services: string[]; // List of service names
  totalPrice: string; // Formatted price (e.g., "₱1,500.00")
  appointmentUrl: string; // URL to view appointment details
}

export function getAppointmentConfirmationEmailHtml(
  options: AppointmentEmailOptions
): string {
  const {
    patientName,
    providerName,
    providerAddress,
    appointmentNumber,
    appointmentDate,
    appointmentTime,
    services,
    totalPrice,
    appointmentUrl,
  } = options;

  const servicesList = services.map((s) => `<li>${s}</li>`).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Confirmed</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
              <!-- Success Header -->
              <tr>
                <td style="padding: 30px; background-color: #10b981; text-align: center;">
                  <div style="width: 60px; height: 60px; margin: 0 auto 15px auto; background-color: rgba(255,255,255,0.2); border-radius: 50%; line-height: 60px; font-size: 28px; color: #ffffff;">
                    ✓
                  </div>
                  <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">Appointment Confirmed!</h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #52525b;">
                    Hi ${patientName},
                  </p>
                  <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 24px; color: #52525b;">
                    Great news! Your appointment has been confirmed. Here are the details:
                  </p>

                  <!-- Appointment Details Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 25px 0; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <tr>
                      <td style="padding: 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                              <span style="font-size: 13px; color: #64748b;">Appointment #</span><br>
                              <span style="font-size: 15px; font-weight: 600; color: #18181b;">${appointmentNumber}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                              <span style="font-size: 13px; color: #64748b;">Provider</span><br>
                              <span style="font-size: 15px; font-weight: 600; color: #18181b;">${providerName}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                              <span style="font-size: 13px; color: #64748b;">Location</span><br>
                              <span style="font-size: 15px; color: #18181b;">${providerAddress}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                              <span style="font-size: 13px; color: #64748b;">Date & Time</span><br>
                              <span style="font-size: 15px; font-weight: 600; color: #18181b;">${appointmentDate} at ${appointmentTime}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                              <span style="font-size: 13px; color: #64748b;">Services</span><br>
                              <ul style="margin: 5px 0 0 0; padding-left: 20px; font-size: 15px; color: #18181b;">
                                ${servicesList}
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0 0 0;">
                              <span style="font-size: 13px; color: #64748b;">Total Amount</span><br>
                              <span style="font-size: 18px; font-weight: 700; color: #10b981;">${totalPrice}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 10px 0 20px 0;">
                        <a href="${appointmentUrl}" style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">View Appointment</a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 20px; color: #71717a;">
                    Please arrive 10-15 minutes before your scheduled appointment time. If you need to reschedule or cancel, please do so at least 24 hours in advance.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; border-top: 1px solid #e4e4e7; background-color: #fafafa;">
                  <p style="margin: 0; font-size: 12px; line-height: 18px; color: #a1a1aa; text-align: center;">
                    This is an automated message from Himsog Healthcare Platform. Please do not reply to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `.trim();
}

export type ReminderType = "24h" | "1h";

export function getAppointmentReminderEmailHtml(
  options: AppointmentEmailOptions,
  reminderType: ReminderType
): string {
  const {
    patientName,
    providerName,
    providerAddress,
    appointmentNumber,
    appointmentDate,
    appointmentTime,
    services,
    totalPrice,
    appointmentUrl,
  } = options;

  const servicesList = services.map((s) => `<li>${s}</li>`).join("");

  const reminderConfig = {
    "24h": {
      title: "Appointment Tomorrow",
      heading: "Reminder: Your Appointment is Tomorrow",
      headerColor: "#3b82f6",
      message: "This is a friendly reminder that you have an appointment scheduled for tomorrow.",
      urgency: "Please ensure you have everything prepared for your visit.",
    },
    "1h": {
      title: "Appointment in 1 Hour",
      heading: "Your Appointment is in 1 Hour",
      headerColor: "#f59e0b",
      message: "Your appointment is coming up in about 1 hour. Please start making your way to the location.",
      urgency: "If you're running late, please contact the provider directly.",
    },
  };

  const config = reminderConfig[reminderType];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
              <!-- Reminder Header -->
              <tr>
                <td style="padding: 30px; background-color: ${config.headerColor}; text-align: center;">
                  <div style="width: 60px; height: 60px; margin: 0 auto 15px auto; background-color: rgba(255,255,255,0.2); border-radius: 50%; line-height: 60px; font-size: 28px; color: #ffffff;">
                    ⏰
                  </div>
                  <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">${config.heading}</h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #52525b;">
                    Hi ${patientName},
                  </p>
                  <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 24px; color: #52525b;">
                    ${config.message}
                  </p>

                  <!-- Appointment Details Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 25px 0; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <tr>
                      <td style="padding: 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                              <span style="font-size: 13px; color: #64748b;">Appointment #</span><br>
                              <span style="font-size: 15px; font-weight: 600; color: #18181b;">${appointmentNumber}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                              <span style="font-size: 13px; color: #64748b;">Provider</span><br>
                              <span style="font-size: 15px; font-weight: 600; color: #18181b;">${providerName}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                              <span style="font-size: 13px; color: #64748b;">Location</span><br>
                              <span style="font-size: 15px; color: #18181b;">${providerAddress}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                              <span style="font-size: 13px; color: #64748b;">Date & Time</span><br>
                              <span style="font-size: 15px; font-weight: 600; color: #18181b;">${appointmentDate} at ${appointmentTime}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                              <span style="font-size: 13px; color: #64748b;">Services</span><br>
                              <ul style="margin: 5px 0 0 0; padding-left: 20px; font-size: 15px; color: #18181b;">
                                ${servicesList}
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0 0 0;">
                              <span style="font-size: 13px; color: #64748b;">Total Amount</span><br>
                              <span style="font-size: 18px; font-weight: 700; color: #10b981;">${totalPrice}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Urgency Notice -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 25px 0;">
                    <tr>
                      <td style="padding: 16px 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 6px 6px 0;">
                        <p style="margin: 0; font-size: 14px; line-height: 20px; color: #92400e;">
                          <strong>Note:</strong> ${config.urgency}
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 10px 0 20px 0;">
                        <a href="${appointmentUrl}" style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">View Appointment</a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 20px; color: #71717a;">
                    Need to reschedule or cancel? Please log in to your account to manage your appointment.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; border-top: 1px solid #e4e4e7; background-color: #fafafa;">
                  <p style="margin: 0; font-size: 12px; line-height: 18px; color: #a1a1aa; text-align: center;">
                    This is an automated message from Himsog Healthcare Platform. Please do not reply to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `.trim();
}

export function getOTPVerificationEmailHtml(
  email: string,
  otp: string,
  type: "email-verification" | "sign-in" | "forget-password"
): string {
  const titles = {
    "email-verification": "Verify Your Email",
    "sign-in": "Your Sign-in Code",
    "forget-password": "Password Reset Code",
  };

  const descriptions = {
    "email-verification": "to verify your email address",
    "sign-in": "to sign in to your account",
    "forget-password": "to reset your password",
  };

  const title = titles[type];
  const description = descriptions[type];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #18181b;">${title}</h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #52525b;">
                    Hi there,
                  </p>
                  <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #52525b;">
                    Use the following code ${description} for your account (<strong>${email}</strong>):
                  </p>

                  <!-- OTP Code -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0 30px 0;">
                        <div style="display: inline-block; padding: 16px 40px; background-color: #f4f4f5; border-radius: 8px; border: 2px dashed #d4d4d8;">
                          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #18181b; font-family: monospace;">${otp}</span>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 20px; color: #71717a; text-align: center;">
                    This code will expire in <strong>10 minutes</strong>.
                  </p>
                  <p style="margin: 0; font-size: 14px; line-height: 20px; color: #71717a; text-align: center;">
                    If you didn't request this code, you can safely ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Security Notice -->
              <tr>
                <td style="padding: 20px 40px; background-color: #fef3c7; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0; font-size: 13px; line-height: 20px; color: #92400e; text-align: center;">
                    <strong>Security tip:</strong> Never share this code with anyone. Our team will never ask for your code.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px 40px 40px; border-top: 1px solid #e4e4e7;">
                  <p style="margin: 0; font-size: 12px; line-height: 18px; color: #a1a1aa; text-align: center;">
                    This is an automated message, please do not reply to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `.trim();
}