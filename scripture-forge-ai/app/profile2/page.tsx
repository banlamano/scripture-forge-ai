import { auth } from "@/lib/auth";

export default async function Profile2Page() {
  const session = await auth();

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Profile Debug</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <p>
        If you can see this, server components can read your session cookies.
      </p>
      <p>
        <a href="/">Go Home</a>
      </p>
    </main>
  );
}
