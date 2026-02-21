import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      avatar?: string | null // <-- Add this
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    avatar?: string | null // <-- Add this
  }
}