import { ICreateAccount, IResetPassword } from '../types/emailTamplate';

const createAccount = (values: { name: string; email: string; otp: number }) => {
  const data = {
    to: values.email,
    subject: 'Verify your Fundraising Account',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
      <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <img src="https://ibb.co.com/HDN60nqv" alt="FundRaise Logo" style="display: block; margin: 0 auto 20px; width:150px" />
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
        <img src="https://ibb.co.com/HDN60nqv" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
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


const donationConfirmation = (values: {
  name: string;
  email: string;
  amount: number;
  causeName: string | undefined;
  causeImage: string | undefined;
}) => {
  const data = {
    to: values.email,
    subject: 'Thank You for Your Donation!',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
      <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <img src="https://ibb.co.com/HDN60nqv" alt="FundRaise Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px;">Hello ${values.name}, Thank You for Your Generosity!</h2>
          <div style="text-align: center; margin-bottom: 20px;">
              <img src="http://10.10.7.23:5000${values.causeImage}" alt="${values.causeName}" style="width: 100%; max-width: 400px; border-radius: 10px; margin-bottom: 15px;" />
              <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">We have received your donation of <strong>$${values.amount}</strong> for <strong>${values.causeName}</strong>.</p>
              <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your support helps us make a real difference. Keep an eye on your email for updates on the cause!</p>
          </div>
          <p style="color: #555; font-size: 14px; line-height: 1.5;">If you have any questions, feel free to contact our support team.</p>
      </div>
    </body>`,
  };
  return data;
};


const resendOtpTemplate = (values: { otp: string | number; email: string }) => {
  return {
    to: values.email,
    subject: "Your OTP Code - MainLand Verification",
    html: `
      <body style="font-family: Arial; background:#f6f6f6; padding:20px;">
        <div style="max-width:600px; margin:auto; background:white; padding:25px; border-radius:10px;">
          
          <div style="text-align:center;">
            <img src="https://ibb.co.com/gLb5SyJ5" alt="MainLand Logo" style="width:140px;" />
          </div>

          <h2 style="color:#277E16; text-align:center;">Your Resent OTP Code</h2>

          <p style="text-align:center;">Use the code below to continue verifying your MainLand account.</p>

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

export const emailTemplate = {
  createAccount,
  resetPassword,
  donationConfirmation,
  // raffleConfirmation,
  resendOtpTemplate,
};


