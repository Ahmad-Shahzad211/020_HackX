import React, { Suspense } from "react";
import LoginPage from "@/components/auth/login";

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
