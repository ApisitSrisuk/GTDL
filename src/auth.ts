import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"

const adminDiscordIds = process.env.ADMIN_DISCORD_IDS?.split(",").map((id) => id.trim()) || []

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = user.role
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === "discord" && account.providerAccountId) {
        const shouldBeAdmin = adminDiscordIds.includes(account.providerAccountId)
        if (shouldBeAdmin) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "admin" },
          })
        }
      }
      return true
    },
  },
})
