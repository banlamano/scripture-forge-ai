import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/profile");
  }

  return <ProfileClient />;
}
