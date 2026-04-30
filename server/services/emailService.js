import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendLotCreatedEmail = async (lot, farm, farmer) => {
  // Skip if email credentials not configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Email not configured. Skipping email notification.');
    return;
  }

  const subject = `New Coffee Lot Created: ${lot.lot_number}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8b5e2e;">New Coffee Lot Created</h2>
      <p><strong>Lot Number:</strong> ${lot.lot_number}</p>
      <p><strong>Farm:</strong> ${farm?.name || 'N/A'}</p>
      <p><strong>Farmer:</strong> ${farmer?.name || 'N/A'}</p>
      <p><strong>Harvest Date:</strong> ${new Date(lot.harvest_date).toLocaleDateString()}</p>
      <p><strong>Quantity:</strong> ${lot.quantity_kg?.toLocaleString()} kg</p>
      <p><strong>Processing Method:</strong> ${lot.processing_method || 'N/A'}</p>
      <hr />
      <p style="color: #666; font-size: 12px;">This is an automated message from Coffee Traceability System.</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@coffeetrace.com',
    to: process.env.ADMIN_EMAIL || 'admin@coffee.com',
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent for lot ${lot.lot_number}`);
  } catch (error) {
    console.error('Email sending failed:', error.message);
  }
};

export const sendLotStatusUpdateEmail = async (lot, oldStatus, newStatus) => {
  // Skip if email credentials not configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Email not configured. Skipping email notification.');
    return;
  }

  const subject = `Lot Status Update: ${lot.lot_number}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8b5e2e;">Lot Status Updated</h2>
      <p><strong>Lot Number:</strong> ${lot.lot_number}</p>
      <p><strong>Status Changed:</strong> ${oldStatus} → ${newStatus}</p>
      <p><strong>Updated at:</strong> ${new Date().toLocaleString()}</p>
      <hr />
      <p style="color: #666; font-size: 12px;">Track this lot at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/trace/${lot.id}</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@coffeetrace.com',
    to: process.env.ADMIN_EMAIL || 'admin@coffee.com',
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Status email sent for lot ${lot.lot_number}`);
  } catch (error) {
    console.error('Email sending failed:', error.message);
  }
};