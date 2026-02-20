import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.account.findUnique({
          where: { username: credentials.username }
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        return {
          id: user.userId.toString(),
          name: user.username,
          avatar: user.avatar,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
   async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id; 
        token.avatar = user.avatar; 
      }
      // This allows the client to dynamically update the active session!
      if (trigger === "update") {
        if (session?.avatar !== undefined) token.avatar = session.avatar;
        if (session?.name !== undefined) token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string; 
        session.user.avatar = token.avatar as string | null | undefined; 
      }
      return session;
    }
  }
};