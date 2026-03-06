import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AdminSidebar from "./AdminSidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/admin/login");
  }
  return (
    <div className="min-h-screen flex bg-admin-bg text-slate-100">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col pt-[calc(3.5rem+env(safe-area-inset-top,0px))] lg:pt-0 bg-gradient-to-b from-admin-bg via-admin-bg to-zinc-950">
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
