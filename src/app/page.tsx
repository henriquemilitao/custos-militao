// app/page.tsx  (SERVER)
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";     // seu export do better-auth
import ClientPage from "@/components/2.0/clientPage"; // componente "use client"

export default async function Page() {
  // pega headers da request e pergunta pro better-auth pelo session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect("/authentication");
  }

  // passa userId (ou outros dados) pro ClientPage
  return <ClientPage userId={session.user.id} />;
}
