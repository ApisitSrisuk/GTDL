import { auth } from "@/auth"
import Navbar from "@/components/layout/Navbar"
import DashboardClient from "@/components/dashboard/DashboardClient"
import { Gamepad2 } from "lucide-react"

export default async function Home() {
  const session = await auth()

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4 text-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/20 via-background to-background">
          <div className="max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="bg-primary/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_-12px_rgba(124,58,237,0.5)]">
              <Gamepad2 className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              LEVEL UP YOUR <br />
              <span className="text-primary">DAILY QUESTS</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your game tasks, daily quests, and boss farms in one centralized gaming dashboard.
            </p>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-4 italic">Please login with Discord to continue</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8">
        <DashboardClient />
      </main>
    </div>
  )
}
