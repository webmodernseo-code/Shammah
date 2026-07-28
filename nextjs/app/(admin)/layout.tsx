import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/dashboard/TopNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-page-bg">
      <TopNav />
      {children}
    </div>
  );
}
