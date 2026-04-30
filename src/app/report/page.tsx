import { auth } from "@/auth"
import Navbar from "@/components/layout/Navbar"
import ReportCenter from "@/components/report/ReportCenter"

export default async function ReportPage() {
  const session = await auth()

  return (
    <div className="min-h-screen flex flex-col bg-background text-white">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8">
        <ReportCenter canSubmit={Boolean(session)} />
      </main>
    </div>
  )
}
