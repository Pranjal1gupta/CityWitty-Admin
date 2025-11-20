import nodemailer from "nodemailer";
import { emailLogger } from "./email-logger";

const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendFailedLoginWarningEmail = async (
  email: string,
  adminName: string,
  failedAttempts: number
) => {
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "⚠️ CityWitty Admin - Multiple Failed Login Attempts",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #fff3cd; border-left: 4px solid #ff6b6b; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #ff6b6b; margin: 0 0 10px 0;">⚠️ Security Alert</h2>
            <p style="margin: 0; color: #333;">Multiple failed login attempts detected on your admin account</p>
          </div>
          
          <p style="color: #333;">Hello ${adminName},</p>
          
          <p style="color: #333;">We detected <strong style="color: #ff6b6b; font-size: 16px;">${failedAttempts} failed login attempts</strong> on your CityWitty Admin account.</p>
          
          <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">What happened?</h3>
            <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
              <li>Someone attempted to login to your account with an incorrect password</li>
              <li>This could be you trying multiple times or a security concern</li>
            </ul>
          </div>
          
          <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">What should you do?</h3>
            <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
              <li>If this was you, please ensure you're using the correct password</li>
              <li>If you don't recognize this activity, please change your password immediately</li>
              <li>Contact your administrator if you need further assistance</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
            This is an automated security alert. Please do not reply to this email. If you have any concerns, contact your system administrator.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 10px;">
            Best regards,<br>CityWitty Admin Security Team
          </p>
        </div>
      `,
    };

    emailLogger.log({
      email,
      type: "other",
      status: "pending",
      metadata: { alertType: "failed_login_warning", failedAttempts },
    });

    await transporter.sendMail(mailOptions);

    emailLogger.log({
      email,
      type: "other",
      status: "sent",
      metadata: { alertType: "failed_login_warning", failedAttempts },
    });

    console.log(`Warning email sent to ${email} for ${failedAttempts} failed attempts`);
    return true;
  } catch (error) {
    console.error("Failed to send warning email:", error);

    emailLogger.log({
      email,
      type: "other",
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
      metadata: { alertType: "failed_login_warning", failedAttempts },
    });

    return false;
  }
};
