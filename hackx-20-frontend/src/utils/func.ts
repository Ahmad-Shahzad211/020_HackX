"use server";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export const decodingJWT = async (token: string | undefined) => {
  return jwt.verify(token || "", process.env.JWT_SECRET || "");
};

export const generateOTP = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp;
};

// function that checks if the user is on mobile
export const isMobile = async () => {
  return typeof window !== "undefined" && window.innerWidth < 768;
};

export const sendVerificationEmail = async (
  email: string,
  otp: number,
  senderEmail?: string,
  senderPass?: string
) => {
  const logoUrl = "/images/Home/court.svg";
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: senderEmail,
      pass: senderPass,
    },
    headers: {
      Precedence: "Bulk",
      "X-Auto-Response-Suppress": "OOF, AutoReply",
    },
  });
  try {
    const info = await transporter.sendMail({
      from: `Chat Legis AI ${senderEmail}`,
      to: email,
      subject: "OTP Verification",
      html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; color: #333;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td align="center" style="padding: 20px 0;">
                  <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #4f46e5; padding: 30px 40px; text-align: center;">
                        <img src=${logoUrl} alt="Chat Legis" style="max-height: 60px; width: auto; margin-bottom: 20px;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Verify Your Account</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <p style="margin-top: 0; margin-bottom: 24px; font-size: 16px; line-height: 1.5; color: #4b5563;">Hello,</p>
                        <p style="margin-top: 0; margin-bottom: 24px; font-size: 16px; line-height: 1.5; color: #4b5563;">Thank you for using Chat Legis. To complete your verification, please use the following One-Time Password (OTP):</p>
                        
                        <!-- OTP Box -->
                        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                          <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Your OTP Code</p>
                          <div style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: 700; letter-spacing: 5px; color: #4f46e5;">
                            ${otp}
                          </div>
                          <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Valid for 30 minutes</p>
                        </div>
                        
                        <p style="margin-top: 0; margin-bottom: 24px; font-size: 16px; line-height: 1.5; color: #4b5563;">If you didn't request this OTP, please ignore this email or contact our support team if you have concerns.</p>
                        
                        <p style="margin-top: 0; margin-bottom: 0; font-size: 16px; line-height: 1.5; color: #4b5563;">Best regards,<br>The Chat Legis Team</p>
                      </td>
                    </tr>
                    
                    <!-- Security Note -->
                    <tr>
                      <td style="padding: 0 40px 30px 40px;">
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #6b7280;">
                            <strong style="color: #4b5563;">Security Tip:</strong> Chat Legis team will never ask for your password or full account details via email.
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f3f4f6; padding: 20px 40px; text-align: center;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                          Need help? Contact us at <a href="mailto:${senderEmail}" style="color: #4f46e5; text-decoration: none;">${senderEmail}</a>
                        </p>
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">
                          &copy; ${new Date().getFullYear()} Chat Legis. All rights reserved.
                        </p>
                        <p style="margin: 10px 0 0 0;">
                          <a href="https://chatlegisai.com" style="display: inline-block; color: #4f46e5; text-decoration: none; font-size: 14px;">Visit our website</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
            `,
    });
  } catch (error: any) {
    error;
    return false;
  }
};
