import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // @ts-ignore
  if (session.user?.cargo === "SUPER_ADMIN") {
    redirect("/admin");
  }

  redirect("/dashboard");
}
