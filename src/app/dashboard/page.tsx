import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardStats } from "./_components/dashboard-stats";
import { RecentActivities } from "./_components/recent-activities";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Painel Principal</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Visão geral dos dados da sua conta
        </p>
      </div>

      <DashboardStats />
      <RecentActivities />
    </div>
  );
}
