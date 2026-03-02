import { cookies } from "next/headers";

const ADMIN_USERNAME = String(process.env.ADMIN_USERNAME);
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD);
const SESSION_COOKIE = String(process.env.SESSION_COOKIE);

export function getTrackingUrl(courierPartner: string, trackingNumber: string): string {
  if (!courierPartner?.trim() || !trackingNumber || trackingNumber.startsWith("REF:")) return "#";
  if (courierPartner === "Delhivery") {
    return `https://www.delhivery.com/track-v2/lr/${trackingNumber}`;
  }
  if (courierPartner === "DP World") {
    return `https://www.logistics.dpworld.com/tracking/in/express?shipment=${trackingNumber}`;
  }
  return "#";
}

export async function login(username: string, password: string): Promise<boolean> {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return true;
  }
  return false;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value === "authenticated";
}
