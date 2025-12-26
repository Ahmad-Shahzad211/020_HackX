import React, { Suspense } from "react";
import OTPVerificationPage from "@/components/auth/verifyOTP";

export default function VerifyOTP() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPVerificationPage />
    </Suspense>
  );
}
