import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: "CANDIDATE" | "RECRUITER" | "ADMIN";
        /** Do authorize() gan sau khi tra role_permissions. */
        permissions?: string[];
      };
    }
  }
}

export {};
