import { OAuth2Client } from "google-auth-library";

let client: OAuth2Client | null = null;

export const getGoogleClientId = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId || clientId.trim().length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_ID. Set it in apps/backend/.env");
  }

  return clientId;
};

export const getGoogleClient = () => {
  if (!client) {
    client = new OAuth2Client(getGoogleClientId());
  }

  return client;
};

export type GoogleProfile = {
  providerUserId: string;
  email: string;
  emailVerified: boolean;
  fullName: string | null;
  avatar: string | null;
};

/**
 * Verify idToken FE lay tu Google Identity Services.
 * Nem loi neu token sai chu ky / het han / sai audience.
 */
export const verifyGoogleIdToken = async (idToken: string): Promise<GoogleProfile> => {
  const ticket = await getGoogleClient().verifyIdToken({
    idToken,
    audience: getGoogleClientId(),
  });

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email) {
    throw new Error("Google id token thiếu sub hoặc email");
  }

  return {
    providerUserId: payload.sub,
    email: payload.email,
    emailVerified: Boolean(payload.email_verified),
    fullName: payload.name ?? null,
    avatar: payload.picture ?? null,
  };
};
