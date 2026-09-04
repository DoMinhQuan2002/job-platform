"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) return children;

  return (
    <GoogleOAuthProvider clientId={clientId} locale="vi">
      {children}
    </GoogleOAuthProvider>
  );
}
