import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    role?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }

  interface AdapterUser {
    role?: string
  }

  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}
