import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const prisma = new PrismaClient();

const handler = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.userId = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.userId as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
});

export { handler as GET, handler as POST };
