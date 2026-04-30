import { auth } from "@/auth"
import Navbar from "@/components/layout/Navbar"
import AdminReportsClient from "@/components/admin/AdminReportsClient"

export default async function AdminReportsPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 text-center">
          <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-10 shadow-2xl shadow-black/20">
            <h1 className="text-2xl font-bold text-white">Access denied</h1>
            <p className="mt-3 text-muted-foreground">Only admin users can view this page.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8">
        <AdminReportsClient />
      </main>
    </div>
  )
}
