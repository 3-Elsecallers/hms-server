export interface IUserPayload {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ISignUpDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface ISignInDetails {
  email: string;
  password: string;
}

export interface IUpdateProfileDetails {
  firstName?: string;
  lastName?: string;
}

export interface IEmailVerificationEvent {
  type: string;
  userId: string;
  email: string;
  verificationCode: string;
}

export interface IEmailVerificationEvent {
  type: string;
  userId: string;
  email: string;
  verificationCode: string;
}

export interface IPasswordResetEvent {
  type: string;
  userId: string;
  email: string;
  passwordResetLink: string;
}