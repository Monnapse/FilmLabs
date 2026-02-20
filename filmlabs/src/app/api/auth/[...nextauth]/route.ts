import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // 1. Find the user in the database
        const user = await prisma.account.findUnique({
          where: { username: credentials.username }
        });

        if (!user) {
          return null; // User not found
        }

        // 2. Verify the password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null; // Incorrect password
        }

        // 3. Return the user object if successful
        return {
          id: user.userId.toString(),
          name: user.username,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login', // We will build this UI in Phase 3
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Attach the database user_id to the session
        session.user.id = token.sub; 
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };