export type IVerifyEmail = {
  email: string;
  otp: number;
};

export type ILoginData = {
  email: string;
  password: string;
};

export type IAuthResetPassword = {
  newPassword: string;
  confirmPassword: string;
};

export type IChangePassword = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
