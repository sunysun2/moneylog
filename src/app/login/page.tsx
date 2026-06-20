import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-base text-sm text-text-muted">
          로딩 중...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
