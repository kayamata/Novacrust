import { redirect } from "next/navigation";

export default function Home() {
  // The landing page is a simple redirect — the real product lives at
  // /dashboard (for authenticated users) or /auth/signin (for guests).
  // We default to /auth/signin; the client AppShell will bounce authed
  // users to /dashboard if they land here while signed in.
  redirect("/auth/signin");
}
