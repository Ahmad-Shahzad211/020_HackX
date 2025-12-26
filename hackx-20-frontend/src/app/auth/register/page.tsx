import React, { Suspense } from "react";
import SignupPage from "@/components/auth/register";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupPage />
    </Suspense>
  );
}
