import { NextResponse } from "next/server";

export async function GET() {
  const googleId = process.env.AUTH_GOOGLE_ID || "";
  const googleSecret = process.env.AUTH_GOOGLE_SECRET || "";
  
  return NextResponse.json({
    hasGoogleId: !!googleId,
    googleIdLength: googleId.length,
    googleIdFull: googleId,
    googleIdHasNewline: googleId.includes("\n") || googleId.includes("\r"),
    hasGoogleSecret: !!googleSecret,
    googleSecretLength: googleSecret.length,
    googleSecretStart: googleSecret.substring(0, 10),
    googleSecretHasNewline: googleSecret.includes("\n") || googleSecret.includes("\r"),
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasAuthUrl: !!process.env.AUTH_URL,
    authUrl: process.env.AUTH_URL || "not set",
    authUrlHasNewline: (process.env.AUTH_URL || "").includes("\n") || (process.env.AUTH_URL || "").includes("\r"),
    nodeEnv: process.env.NODE_ENV,
  });
}
