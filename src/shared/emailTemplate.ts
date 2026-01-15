import { ICreateAccount, IResetPassword } from '../types/emailTamplate';

const websiteLogo = "https://i.postimg.cc/8C3qdnNC/fe8f54bc27306daa2de1fb8b0c27809327e76a52.png";

const createAccount = (values: { name: string; email: string; otp: number }) => {
  const data = {
    to: values.email,
    subject: 'Verify your Fundraising Account',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
      <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <img src="${websiteLogo}" alt="FundRaise Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px;">Hello ${values.name}, Welcome to FundRaise!</h2>
          <div style="text-align: center;">
              <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your verification code is:</p>
              <div style="background-color: #277E16; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
              <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes. Use it to verify your fundraising account and start your campaign.</p>
          </div>
          <p style="color: #555; font-size: 14px; line-height: 1.5;">If you did not request this, please ignore this email.</p>
      </div>
    </body>`,
  };
  return data;
};


const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="${websiteLogo}" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #277E16; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                <p style="color: #b9b4b4; font-size: 16px; line-height: 1.5; margin-bottom: 20px;text-align:left">If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const resendOtpTemplate = (values: { otp: string | number; email: string }) => {
  return {
    to: values.email,
    subject: "Your OTP Code - My Garage Verification",
    html: `
      <body style="font-family: Arial; background:#f6f6f6; padding:20px;">
        <div style="max-width:600px; margin:auto; background:white; padding:25px; border-radius:10px;">
          
          <div style="text-align:center;">
            <img src="${websiteLogo}" alt="My Garage Logo" style="width:140px;" />
          </div>

          <h2 style="color:#277E16; text-align:center;">Your Resent OTP Code</h2>

          <p style="text-align:center;">Use the code below to continue verifying your My Garage account.</p>

          <div style="text-align:center; margin:25px 0;">
            <div style="display:inline-block; background:#277E16; color:white; padding:15px 25px; border-radius:8px; font-size:28px; font-weight:bold; letter-spacing:3px;">
              ${values.otp}
            </div>
          </div>

          <p style="text-align:center; color:#666;">This OTP will expire in <strong>5 minutes</strong>.</p>
        </div>
      </body>
    `,
  };
};


const purchaseConfirmationTemplate = (values: {
  name: string;
  email: string;
  itemName: string;
  image: string;
  itemPrice: number;

}) => {
  return {
    to: values.email,
    subject: "🎉 Purchase Confirmed - Your Item is On The Way!",
    html: `
      <body style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px; margin:0;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header with Logo -->
          <div style="background:#277E16; padding:25px; text-align:center;">
            <img src="${websiteLogo}" alt="My Garage Logo" style="width:120px;" />
            <h1 style="color:white; margin:15px 0 0 0; font-size:24px;">Purchase Successful!</h1>
          </div>

          <!-- Main Content -->
          <div style="padding:30px;">
            
            <!-- Welcome Message -->
            <div style="text-align:center; margin-bottom:25px;">
              <div style="display:inline-block; background:#e8f5e9; color:#277E16; padding:8px 20px; border-radius:20px; font-weight:bold; font-size:14px;">
                ✓ Order Confirmed
              </div>
            </div>

            <h2 style="color:#333; text-align:center; margin:0 0 10px 0;">
              Welcome, ${values.name}! 🎊
            </h2>
            <p style="text-align:center; color:#666; font-size:15px; line-height:1.6; margin:0 0 30px 0;">
              Thank you for your purchase! We're excited to deliver your item to you.
            </p>

            <!-- Purchased Item Card -->
            <div style="border:2px solid #277E16; border-radius:10px; padding:20px; margin:20px 0; background:#fafafa;">
              <h3 style="color:#277E16; margin:0 0 15px 0; font-size:18px; text-align:center;">
                📦 Your Purchased Item
              </h3>
              
              <div style="display:flex; align-items:center; gap:20px;">
                <!-- Item Image -->
                <div style="flex-shrink:0;">
                  <img src="${values.image}" alt="${values.itemName}" 
                       style="width:120px; height:120px; object-fit:cover; border-radius:8px; border:3px solid #277E16;" />
                </div>
                
                <!-- Item Info -->
                <div style="flex-grow:1;">
                  <h4 style="color:#333; margin:0 0 8px 0; font-size:18px;">
                    ${values.itemName}
                  </h4>
                  <p style="color:#666; margin:0; font-size:14px;">
                    <strong>Price:</strong> ${values.itemPrice} Coins 🪙
                  </p>
                </div>
              </div>
            </div>

            <!-- Delivery Notice -->
            <div style="background:#fff9e6; border-left:4px solid #ffa726; padding:15px 20px; border-radius:6px; margin:25px 0;">
              <p style="margin:0; color:#f57c00; font-size:14px; line-height:1.6;">
                <strong>📅 Delivery Information:</strong><br/>
                Your item will be delivered within <strong>3-5 business days</strong>. 
                We'll notify you once it's on the way!
              </p>
            </div>

            <!-- Call to Action -->
            <div style="text-align:center; margin:30px 0;">
              <a href="${process.env.CLIENT_URL}/dashboard/my-purchases" 
                 style="display:inline-block; background:#277E16; color:white; padding:14px 35px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:15px;">
                View My Purchases
              </a>
            </div>

            <!-- Thank You Message -->
            <div style="background:#f5f5f5; padding:15px; border-radius:8px; text-align:center; margin-top:25px;">
              <p style="margin:0; color:#666; font-size:14px; line-height:1.6;">
                Thank you for choosing <strong style="color:#277E16;">My Garage</strong>!<br/>
                We appreciate your trust in us. 💚
              </p>
            </div>

          </div>

          <!-- Footer -->
          <div style="background:#f9f9f9; padding:20px; text-align:center; border-top:1px solid #e0e0e0;">
            <p style="margin:0 0 8px 0; color:#999; font-size:12px;">
              Need help? Contact us at <a href="mailto:support@My Garage.com" style="color:#277E16; text-decoration:none;">support@My Garage.com</a>
            </p>
            <p style="margin:0; color:#999; font-size:12px;">
              This is an automated email from My Garage. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
    `,
  };
};

// Admin/Owner Notification Email
const adminPurchaseNotificationTemplate = (values: {
  buyerName: string;
  buyerEmail: string;
  itemName: string;
  image: string;
  itemPrice: number;
  purchaseDate: string;
}) => {
  return {
    to: process.env.ADMIN_EMAIL,
    subject: "🔔 New Purchase Alert - My Garage",
    html: `
      <body style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px; margin:0;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background:#277E16; padding:25px; text-align:center;">
            <img src="${websiteLogo}" alt="My Garage Logo" style="width:120px;" />
            <h1 style="color:white; margin:15px 0 0 0; font-size:24px;">New Purchase Alert! 🎉</h1>
          </div>

          <!-- Main Content -->
          <div style="padding:30px;">
            
            <!-- Alert Badge -->
            <div style="text-align:center; margin-bottom:25px;">
              <div style="display:inline-block; background:#ff9800; color:white; padding:8px 20px; border-radius:20px; font-weight:bold; font-size:14px;">
                🔔 New Order Received
              </div>
            </div>

            <p style="text-align:center; color:#666; font-size:15px; margin-bottom:30px;">
              A customer has just made a purchase on your platform.
            </p>

            <!-- Buyer Information -->
            <div style="background:#f9f9f9; border-left:4px solid #277E16; padding:20px; border-radius:6px; margin:20px 0;">
              <h3 style="color:#277E16; margin:0 0 15px 0; font-size:18px;">
                👤 Buyer Information
              </h3>
              <table style="width:100%; border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0; color:#666; font-size:14px; width:120px;">
                    <strong>Name:</strong>
                  </td>
                  <td style="padding:8px 0; color:#333; font-size:14px;">
                    ${values.buyerName}
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0; color:#666; font-size:14px;">
                    <strong>Email:</strong>
                  </td>
                  <td style="padding:8px 0; color:#333; font-size:14px;">
                    ${values.buyerEmail}
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0; color:#666; font-size:14px;">
                    <strong>Date:</strong>
                  </td>
                  <td style="padding:8px 0; color:#333; font-size:14px;">
                    ${values.purchaseDate}
                  </td>
                </tr>
              </table>
            </div>

            <!-- Item Details -->
            <div style="border:2px solid #277E16; border-radius:10px; padding:20px; margin:20px 0; background:white;">
              <h3 style="color:#277E16; margin:0 0 15px 0; font-size:18px;">
                📦 Purchased Item
              </h3>
              
              <div style="display:flex; align-items:center; gap:20px;">
                <div style="flex-shrink:0;">
                  <img src="${values.image}" alt="${values.itemName}" 
                       style="width:100px; height:100px; object-fit:cover; border-radius:8px; border:2px solid #277E16;" />
                </div>
                
                <div style="flex-grow:1;">
                  <h4 style="color:#333; margin:0 0 8px 0; font-size:16px;">
                    ${values.itemName}
                  </h4>
                  <p style="color:#277E16; margin:0; font-size:18px; font-weight:bold;">
                    ${values.itemPrice} Coins 🪙
                  </p>
                </div>
              </div>
            </div>

            <!-- Action Required -->
            <div style="background:#fff3e0; border-left:4px solid #ff9800; padding:15px 20px; border-radius:6px; margin:25px 0;">
              <p style="margin:0; color:#e65100; font-size:14px; line-height:1.6;">
                <strong>⚡ Action Required:</strong><br/>
                Please prepare and ship this item within <strong>3-5 business days</strong>.
              </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align:center; margin:30px 0;">
              <a href="${process.env.CLIENT_URL}/admin/orders" 
                 style="display:inline-block; background:#277E16; color:white; padding:14px 35px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:15px;">
                View Order Details
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background:#f9f9f9; padding:20px; text-align:center; border-top:1px solid #e0e0e0;">
            <p style="margin:0; color:#999; font-size:12px;">
              This is an automated notification from My Garage Admin Panel.
            </p>
          </div>

        </div>
      </body>
    `,
  };
};

export const emailTemplate = {
  createAccount,
  resetPassword,
  // raffleConfirmation,
  resendOtpTemplate,
  purchaseConfirmationTemplate,
  adminPurchaseNotificationTemplate
};


