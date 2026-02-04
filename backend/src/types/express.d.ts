declare global {
  namespace Express {
    interface User {
      id: string;
      role?: string;
      email?: string;
      isActive?: boolean;
      is2faEnabled?: boolean;
      twoFactorVerified?: boolean;
      temp?: boolean;
      [key: string]: unknown;
    }

    interface Request {
      user: User;
    }
  }
}

export {};
