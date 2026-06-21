import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyPassword } from "@/lib/crypto";
import { findLegacyUser } from "@/lib/user-setup";
import { normalizeLoginId } from "@/lib/validate-auth-fields";

const AUTH_USER_FIELDS = "passwordHash loginId nickname role";

async function loadAuthUser(loginId: string) {
  return User.findOne({ loginId }).select(AUTH_USER_FIELDS);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        loginId: { label: "Login ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.loginId || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();
          const normalizedLoginId = normalizeLoginId(credentials.loginId);

          let user = await loadAuthUser(normalizedLoginId);

          if (!user) {
            const legacy = await findLegacyUser();
            if (legacy) {
              const isLegacyValid = await verifyPassword(
                credentials.password,
                legacy.passwordHash
              );
              if (isLegacyValid) {
                await User.findByIdAndUpdate(legacy._id, {
                  loginId: normalizedLoginId,
                  nickname: legacy.nickname?.trim() || "관리자",
                  role: "admin",
                });
                user = await loadAuthUser(normalizedLoginId);
              }
            }
          }

          if (!user?.loginId) {
            return null;
          }

          const isValid = await verifyPassword(
            credentials.password,
            user.passwordHash
          );

          if (!isValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            loginId: user.loginId,
            nickname: user.nickname,
            role: user.role ?? "admin",
          };
        } catch (error) {
          console.error("[auth] authorize failed:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.loginId = user.loginId;
        token.nickname = user.nickname;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.loginId = token.loginId as string;
        session.user.nickname = token.nickname as string;
        session.user.role = token.role as "admin" | "member";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
