import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer transport.
 * If SMTP credentials are missing, falls back to logging the email to console.
 */
const createTransporter = () => {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_USER !== 'your_email@gmail.com'
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
};

/**
 * Send account setup invite email to newly added Lab Assistant
 */
export const sendAssistantSetupEmail = async ({ toEmail, name, setupToken }) => {
  const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const setupUrl = `${clientBaseUrl}/setup-password?token=${setupToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Lab Equipment System" <noreply@labtracking.univ.edu>',
    to: toEmail,
    subject: 'Welcome to Lab Equipment System - Set Up Your Assistant Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e293b;">Welcome, ${name}!</h2>
        <p>You have been assigned as a <strong>Lab Assistant</strong> in the University Laboratory Equipment & Fault Tracking System.</p>
        <p>Please click the button below to set up your secure password and activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${setupUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Set Up Your Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px;">This setup link will expire in 48 hours. If you did not expect this invitation, please contact your laboratory administrator.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">Link: <a href="${setupUrl}">${setupUrl}</a></p>
      </div>
    `
  };

  const transporter = createTransporter();

  if (transporter) {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Setup invitation sent to ${toEmail}`);
  } else {
    console.log('---------------------------------------------------------');
    console.log(`[Email Mock] Setup link for ${name} (${toEmail}):`);
    console.log(`Setup URL: ${setupUrl}`);
    console.log('---------------------------------------------------------');
  }

  return setupUrl;
};
