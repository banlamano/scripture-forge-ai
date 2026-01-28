import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ProfileClient from "./profile-client";
import type { Session } from "next-auth";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/profile");
  }

  return <ProfileClient session={session as Session} />;
}
