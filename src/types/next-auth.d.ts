import "next-auth";
import type { UserRole } from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      loginId: string;
      nickname: string;
      role: UserRole;
    };
  }

  interface User {
    id: string;
    loginId: string;
    nickname: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    loginId?: string;
    nickname?: string;
    role?: UserRole;
  }
}
