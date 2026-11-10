import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer transport.
 * Supports GMAIL_USER & GMAIL_APP_PASSWORD (primary requirement)
 * as well as legacy SMTP_HOST/SMTP_USER/SMTP_PASS.
 */
const createTransporter = () => {
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  const isConfigured =
    gmailUser &&
    gmailPass &&
    gmailUser !== 'your_email@gmail.com' &&
    gmailPass !== 'your_gmail_app_password_here';

  if (!isConfigured) {
    return null;
  }

  // If using Gmail App Password, use the Gmail service
  if (process.env.GMAIL_USER || (!process.env.SMTP_HOST || process.env.SMTP_HOST.includes('gmail'))) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });
  }

  // Generic custom SMTP host
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: gmailUser,
      pass: gmailPass
    }
  });
};

const getFromAddress = () => {
  const fromEmail = process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@labtrack.edu';
  return process.env.EMAIL_FROM || `"LabTrack System" <${fromEmail}>`;
};

/**
 * 1. Send Password Reset OTP (Administrator, Assistant, Student)
 */
export const sendPasswordResetOtp = async ({ toEmail, name, otp }) => {
  const mailOptions = {
    from: getFromAddress(),
    to: toEmail,
    subject: `[LabTrack] Your Password Reset OTP: ${otp}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 22px;">Digital Lab Equipment Tracking System</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Password Reset Verification</p>
        </div>
        <p style="font-size: 14px; color: #334155;">Hello <strong>${name || 'User'}</strong>,</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">
          We received a request to reset your password. Use the 6-digit One-Time Password (OTP) below to proceed:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; background: #eff6ff; padding: 14px 28px; border-radius: 10px; border: 1px dashed #60a5fa;">
            ${otp}
          </span>
        </div>
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #991b1b; font-size: 13px; margin: 0; font-weight: 500;">
            ⚠️ This OTP is strictly valid for <strong>5 minutes</strong> only and can be used once. Never share this code with anyone.
          </p>
        </div>
        <p style="color: #64748b; font-size: 12px;">If you did not request this password reset, please ignore this email or notify your system administrator immediately.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">LabTrack Pro — University Lab Management</p>
      </div>
    `
  };

  const transporter = createTransporter();
  if (transporter) {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Password Reset OTP sent to ${toEmail}`);
  } else {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`[Email Mock] 🔑 PASSWORD RESET OTP`);
    console.log(`Recipient : ${toEmail} (${name})`);
    console.log(`OTP Code  : ${otp} (Valid for 5 minutes)`);
    console.log('═══════════════════════════════════════════════════════════\n');
  }
};

/**
 * 2. Send Email When a Student Raises a Ticket (Sent to Assigned Lab Assistant)
 */
export const sendTicketRaisedAssistantNotification = async ({
  toEmail,
  assistantName,
  ticketId,
  equipmentName,
  labName,
  studentName,
  studentRollNumber,
  description,
  createdAt
}) => {
  const formattedDate = new Date(createdAt || Date.now()).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const mailOptions = {
    from: getFromAddress(),
    to: toEmail,
    subject: `[Action Required] New Fault Ticket #${ticketId} in ${labName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="border-bottom: 2px solid #ef4444; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin: 0; font-size: 20px;">⚠️ New Equipment Fault Reported</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Laboratory: <strong>${labName}</strong></p>
        </div>
        <p style="font-size: 14px; color: #334155;">Hello <strong>${assistantName}</strong>,</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.5;">
          A student has reported an equipment malfunction in your assigned laboratory. Please review the details below:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
          <tr style="background: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Ticket ID</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #2563eb; font-weight: bold;">${ticketId}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Equipment</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${equipmentName}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Laboratory</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${labName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Reported By</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${studentName} (${studentRollNumber})</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Date & Time</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; vertical-align: top;">Fault Description</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #b91c1c; font-style: italic;">"${description}"</td>
          </tr>
        </table>

        <p style="font-size: 13px; color: #475569;">Please log in to your Assistant Dashboard to update the ticket status and initiate repair proceedings.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">LabTrack Pro — University Lab Management</p>
      </div>
    `
  };

  const transporter = createTransporter();
  if (transporter) {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Fault notification sent to Assistant ${toEmail}`);
  } else {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`[Email Mock] 🚨 NEW TICKET ALERT TO ASSISTANT`);
    console.log(`Recipient : ${toEmail} (${assistantName})`);
    console.log(`Ticket ID : ${ticketId} | Equipment: ${equipmentName}`);
    console.log(`Lab       : ${labName} | Student: ${studentName} (${studentRollNumber})`);
    console.log(`Fault     : "${description}"`);
    console.log('═══════════════════════════════════════════════════════════\n');
  }
};

/**
 * 3. Send Email When Administrator Adds a Lab Assistant
 */
export const sendAssistantCreatedEmail = async ({
  toEmail,
  name,
  assistantId,
  tempPassword,
  loginUrl
}) => {
  const clientBase = process.env.CLIENT_URL || 'http://localhost:5173';
  const resolvedLoginUrl = loginUrl || `${clientBase}/login`;

  const mailOptions = {
    from: getFromAddress(),
    to: toEmail,
    subject: `Welcome to LabTrack - Your Assistant Account Credentials (${assistantId})`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 22px;">Digital Lab Equipment Tracking System</h2>
          <p style="color: #2563eb; font-size: 14px; font-weight: 600; margin-top: 4px;">Lab Assistant Account Activation</p>
        </div>
        <p style="font-size: 14px; color: #334155;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">
          An administrator has registered your account as a <strong>Lab Assistant</strong>. You can now log in using the credentials below:
        </p>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <p style="margin: 6px 0; font-size: 13px; color: #475569;"><strong>Assistant ID:</strong> <span style="font-family: monospace; font-size: 14px; color: #0284c7;">${assistantId}</span></p>
          <p style="margin: 6px 0; font-size: 13px; color: #475569;"><strong>Login Email:</strong> <span style="font-family: monospace; font-size: 14px; color: #0f172a;">${toEmail}</span></p>
          <p style="margin: 6px 0; font-size: 13px; color: #475569;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 15px; color: #dc2626; font-weight: bold; background: #fee2e2; padding: 2px 8px; border-radius: 4px;">${tempPassword}</span></p>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${resolvedLoginUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">
            Sign In to Portal
          </a>
        </div>

        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #92400e; font-size: 12px; margin: 0; font-weight: 500;">
            🔒 Security Notice: For your safety, you will be prompted to set a new personal password upon your first sign in.
          </p>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">LabTrack Pro — University Lab Management</p>
      </div>
    `
  };

  const transporter = createTransporter();
  if (transporter) {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Assistant credentials sent to ${toEmail}`);
  } else {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`[Email Mock] 📋 LAB ASSISTANT ACCOUNT CREATED`);
    console.log(`Recipient    : ${toEmail} (${name})`);
    console.log(`Assistant ID : ${assistantId}`);
    console.log(`Temp Password: ${tempPassword}`);
    console.log(`Login URL    : ${resolvedLoginUrl}`);
    console.log('═══════════════════════════════════════════════════════════\n');
  }
};

/**
 * 4. Send Ticket Status Transition Email (Sent to Student)
 */
export const sendTicketStatusChangedEmail = async ({
  toEmail,
  studentName,
  ticketId,
  equipmentName,
  oldStatus,
  newStatus,
  resolutionNotes,
  updatedAt
}) => {
  const formattedDate = new Date(updatedAt || Date.now()).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return '#16a34a'; // Green
      case 'In Repair': return '#d97706'; // Amber
      case 'Under Review': return '#2563eb'; // Blue
      case 'Expired': return '#64748b'; // Gray
      default: return '#dc2626'; // Red
    }
  };

  const statusColor = getStatusColor(newStatus);

  const mailOptions = {
    from: getFromAddress(),
    to: toEmail,
    subject: `[Status Update] Ticket #${ticketId} is now ${newStatus}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="border-bottom: 2px solid ${statusColor}; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 20px;">Ticket Status Notification</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Tracking ID: <strong>${ticketId}</strong></p>
        </div>
        <p style="font-size: 14px; color: #334155;">Hello <strong>${studentName}</strong>,</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.5;">
          The status of your equipment fault ticket has been updated by the laboratory staff:
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <span style="display: inline-block; padding: 10px 24px; border-radius: 50px; background: ${statusColor}15; color: ${statusColor}; font-weight: bold; font-size: 16px; border: 1px solid ${statusColor}40;">
            ${newStatus}
          </span>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
          <tr style="background: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Equipment</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${equipmentName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Previous Status</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #64748b;">${oldStatus || 'Open'}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Current Status</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: ${statusColor};">${newStatus}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Updated On</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${formattedDate}</td>
          </tr>
          ${
            resolutionNotes
              ? `<tr style="background: #f8fafc;">
                  <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; vertical-align: top;">Resolution Notes</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0; color: #16a34a; font-weight: 500;">${resolutionNotes}</td>
                </tr>`
              : ''
          }
        </table>

        <p style="font-size: 13px; color: #475569;">You can check your ticket history anytime by logging into your Student Dashboard.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">LabTrack Pro — University Lab Management</p>
      </div>
    `
  };

  const transporter = createTransporter();
  if (transporter) {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Ticket status update sent to ${toEmail}`);
  } else {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`[Email Mock] 🔔 TICKET STATUS CHANGED`);
    console.log(`Recipient  : ${toEmail} (${studentName})`);
    console.log(`Ticket ID  : ${ticketId} | Equipment: ${equipmentName}`);
    console.log(`Transition : ${oldStatus} ➔ ${newStatus}`);
    if (resolutionNotes) console.log(`Notes      : "${resolutionNotes}"`);
    console.log('═══════════════════════════════════════════════════════════\n');
  }
};

/**
 * 5. Send Email When Student Account is Created (upon 1st ticket)
 */
export const sendStudentAccountCreatedEmail = async ({
  toEmail,
  name,
  rollNumber,
  tempPassword,
  loginUrl
}) => {
  const clientBase = process.env.CLIENT_URL || 'http://localhost:5173';
  const resolvedLoginUrl = loginUrl || `${clientBase}/login`;

  const mailOptions = {
    from: getFromAddress(),
    to: toEmail,
    subject: `Your Student Account for Lab Equipment Tracking (${rollNumber})`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 22px;">Digital Lab Equipment Tracking System</h2>
          <p style="color: #2563eb; font-size: 14px; font-weight: 600; margin-top: 4px;">Student Account Created</p>
        </div>
        <p style="font-size: 14px; color: #334155;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">
          A student portal account has been created for you following your recent equipment fault submission. You can log in to view and track all your tickets in real time.
        </p>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <p style="margin: 6px 0; font-size: 13px; color: #475569;"><strong>Roll Number (Login ID):</strong> <span style="font-family: monospace; font-size: 14px; color: #0284c7; font-weight: bold;">${rollNumber}</span></p>
          <p style="margin: 6px 0; font-size: 13px; color: #475569;"><strong>Registered Email:</strong> <span style="font-family: monospace; font-size: 14px; color: #0f172a;">${toEmail}</span></p>
          <p style="margin: 6px 0; font-size: 13px; color: #475569;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 15px; color: #dc2626; font-weight: bold; background: #fee2e2; padding: 2px 8px; border-radius: 4px;">${tempPassword}</span></p>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${resolvedLoginUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">
            Sign In to Student Dashboard
          </a>
        </div>

        <p style="color: #64748b; font-size: 12px;">You can change your password anytime through the "Forgot Password" or account options.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">LabTrack Pro — University Lab Management</p>
      </div>
    `
  };

  const transporter = createTransporter();
  if (transporter) {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Student account credentials sent to ${toEmail}`);
  } else {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`[Email Mock] 🎓 STUDENT ACCOUNT CREATED`);
    console.log(`Recipient    : ${toEmail} (${name})`);
    console.log(`Roll Number  : ${rollNumber}`);
    console.log(`Temp Password: ${tempPassword}`);
    console.log(`Login URL    : ${resolvedLoginUrl}`);
    console.log('═══════════════════════════════════════════════════════════\n');
  }
};

/**
 * Legacy / Fallback setup email for compatibility
 */
export const sendAssistantSetupEmail = async ({ toEmail, name, setupToken }) => {
  const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const setupUrl = `${clientBaseUrl}/setup-password?token=${setupToken}`;
  return sendAssistantCreatedEmail({
    toEmail,
    name,
    assistantId: 'AST-LEGACY',
    tempPassword: 'SetViaLinkOrAdmin',
    loginUrl: setupUrl
  });
};
