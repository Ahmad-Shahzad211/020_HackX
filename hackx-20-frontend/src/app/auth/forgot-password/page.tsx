"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import Image from "next/image";
import legisStore from "@/store/legisStore";

import { forgotPasswordHandler } from "@/handlers/regloHandler";
import ChangePasswordPage from "@/components/auth/changePassword";
import OTPVerificationPage from "@/components/auth/verifyOTP";
import Link from "next/dist/client/link";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .matches(/^[^+]*$/, "Email must not contain '+'")
    .required("Email is required"),
});

export default function ForgotPasswordPage() {
  const { email, setEmail } = legisStore();
  const [otp, showOTP] = useState(false);
  const [newPasswordForm, setNewPasswordForm] = useState(false);
  const [error, setError] = useState("");

  return otp ? (
    <OTPVerificationPage
      showOTP={showOTP}
      setNewPasswordForm={setNewPasswordForm}
    />
  ) : newPasswordForm ? (
    <ChangePasswordPage email={email} />
  ) : (
    <div className="flex justify-center items-center min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--background)' }}>
      {/* Base Container */}

      <div className="w-full max-w-lg">
        <div className="rounded-xl p-4 sm:p-6 lg:p-8 w-full lg:w-[85%] shadow-lg transition-colors duration-300" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-border)', borderWidth: 1 }}>
          <div className="mb-4 text-start">
            <Link href="/">
              <Image
                src="/chatlegis.svg"
                alt="Reglo Logo"
                width={50}
                height={10}
              />
            </Link>
            <h2 className="text-xl sm:text-2xl font-semibold mt-2 transition-colors duration-300" style={{ color: 'var(--color-primary)' }}>
              Forgot Password
            </h2>
            <p className="text-sm mt-2 transition-colors duration-300" style={{ color: 'var(--color-text-muted)' }}>
              Enter your email address and we&apos;ll send you OTP to reset
              password.
            </p>
          </div>

          <Formik
            initialValues={{ email: email }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              const resp = await forgotPasswordHandler(values);

              setEmail(values.email);
              if (resp.status === 200) {
                showOTP(true);
              } else if (resp.status === 404) {
                setError(resp.message.message);
              }
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1 transition-colors duration-300"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Email Address
                  </label>
                  <Field
                    id="email"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all duration-200`}
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: errors.email && touched.email ? '#ef4444' : 'var(--color-border)',
                      color: 'var(--color-text)',
                      boxShadow: errors.email && touched.email ? '0 0 0 2px #fee2e2' : undefined
                    }}
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>
                <div className="text-end">
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium hover:underline transition-colors duration-300"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Back to Login
                  </Link>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-medium py-3 px-4 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(to right, var(--color-primary), var(--color-primary-hover))',
                    color: '#fff',
                  }}
                >
                  {isSubmitting ? "Sending..." : "Send OTP"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
