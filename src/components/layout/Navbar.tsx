import Link from "next/link"
import { auth, signIn, signOut } from "@/auth"
import { Gamepad2, LogOut, User } from "lucide-react"

export default async function Navbar() {
  const session = await auth()

  return (
    <nav className="border-b border-white/5 bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Gamepad2 className="w-8 h-8" />
          <span>GTDL</span>
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <a href="/report" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">
                Report
              </a>
              {session.user?.role === "admin" && (
                <a href="/admin/reports" className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary transition hover:bg-primary/20">
                  Admin
                </a>
              )}
              <div className="flex items-center gap-2 text-sm">
                {session.user?.image ? (
                  <img src={session.user.image} alt="" className="w-8 h-8 rounded-full border border-primary" />
                ) : (
                  <User className="w-8 h-8 p-1 rounded-full border border-primary" />
                )}
                <span className="hidden sm:inline font-medium">{session.user?.name}</span>
              </div>
              <form action={async () => {
                "use server"
                await signOut()
              }}>
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </form>
            </div>
          ) : (
            <form action={async () => {
              "use server"
              await signIn("discord")
            }}>
              <button className="gaming-button flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                Login with Discord
              </button>
            </form>
          )}
        </div>
      </div>
    </nav>
  )
}
