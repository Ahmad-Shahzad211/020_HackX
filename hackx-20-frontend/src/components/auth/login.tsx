"use client";

import Image from "next/image";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { UAParser } from "ua-parser-js";
import { loginHandler } from "@/handlers/regloHandler";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InfoMessage from "@/components/Message";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useUserStore } from "@/app/cl/store/userInfoStore";
import legisStore from "@/store/legisStore";
import { getLocation } from "@/utils/clientUtils";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [runtimeMessage, setRuntimeMessage] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const route = useRouter();
  const searchParams = useSearchParams();

  const setUserName = useUserStore((state) => state.setUserName);
  const setUserRole = useUserStore((state) => state.setUserRole);
  const setEmail = legisStore((state) => state.setEmail);

  /* ----------------------------
     URL-derived error (NO state)
  ----------------------------- */
  const error = searchParams.get("error");

  const urlMessage = (() => {
    switch (error) {
      case "google_auth_failed":
        return "Google authentication failed. Please try again.";
      case "token_exchange_failed":
        return "Failed to exchange Google token. Please try again.";
      case "no_email_provided":
        return "Google account does not have an email address.";
      case "email_already_registered":
        return "This email is already registered with email/password. Please use email login.";
      case "authentication_failed":
        return "Authentication failed. Please try again.";
      default:
        return "";
    }
  })();

  /* ----------------------------
     Final message to display
  ----------------------------- */
  const message = runtimeMessage || urlMessage;

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const handleFacebookLogin = () => {
    console.log("Facebook login");
  };

  const handleAppleLogin = () => {
    console.log("Apple login");
  };

  return (
    <div className="flex justify-center items-center min-h-screen transition-colors duration-300 p-4" style={{ backgroundColor: 'var(--color-card-bg)' }}>
      <div className="w-full max-w-lg">
        <div className="rounded-xl p-4 sm:p-6 lg:p-8 w-full lg:w-[85%] shadow-lg transition-colors duration-300" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--color-border)', borderWidth: 1 }}>
          <div className="mb-4 text-center">
            <Link href="/">
              <Image
                src="/chatlegis.svg"
                alt="Reglo Logo"
                width={50}
                height={10}
              />
            </Link>
            <h2 className="text-xl sm:text-2xl font-semibold mt-2 transition-colors duration-300" style={{ color: 'var(--color-primary)' }}>
              Welcome back
            </h2>
          </div>

          <Formik
            initialValues={{
              email: "",
              password: "",
              ipAddress: "",
              city: "",
              country: "",
              browser: "",
              browserVersion: "",
              osName: "",
            }}
            validationSchema={LoginSchema}
            onSubmit={async (values) => {
              try {
                const locationInfo = await getLocation();
                const devices = UAParser(navigator.userAgent);

                values.browser = devices.browser.name || "";
                values.browserVersion = devices.browser.version || "";
                values.osName = devices.os.name || "";
                values.ipAddress = locationInfo.ip;
                values.city = locationInfo.city;
                values.country = locationInfo.country;

                const resp = await loginHandler({ ...values, isAdminLogin });

                if (resp.status === 200) {
                  console.log("Login response:", resp.data);
                  console.log("User role from API:", resp.data.role);
                  setUserName(resp.data.fullName);
                  if (setUserRole) {
                    setUserRole(resp.data.role || "user");
                    console.log("Role set to:", resp.data.role || "user");
                  }
                  setRuntimeMessage(resp.data.message);
                  
                  // Redirect based on user role
                  if (resp.data.role === "admin") {
                    route.push("/cl/admin-dashboard");
                  } else {
                    route.push("/cl/chatscreen");
                  }
                  return;
                }

                if (resp.status === 403) {
                  setEmail(values.email);
                  setRuntimeMessage(resp.message);
                  route.push("/auth/verify-otp?requiresOTP=true");
                  return;
                }

                if (resp.status === 500) {
                  setRuntimeMessage(
                    "An error occurred. Please try again later."
                  );
                  return;
                }

                setRuntimeMessage(resp.message);
              } catch (err: any) {
                setRuntimeMessage(err?.message || "Something went wrong");
              }
            }}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-4">
                <div>
                  <Field
                    type="email"
                    name="email"
                    placeholder="ABC@gmail.com"
                    className="w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--color-card-bg)',
                      borderColor: errors.email && touched.email ? '#ef4444' : 'var(--color-border)',
                      color: 'var(--color-text)',
                      boxShadow: errors.email && touched.email ? '0 0 0 2px #fee2e2' : undefined
                    }}
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
                <div className="flex items-center px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--color-card-bg)' }}>
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter Password"
                    className="bg-transparent outline-none w-full"
                    style={{ color: 'var(--color-text)', '::placeholder': { color: 'var(--color-text-muted)' } }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash style={{ color: 'var(--color-text-muted)' }} />
                    ) : (
                      <FaEye style={{ color: 'var(--color-text-muted)' }} />
                    )}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <label className="flex items-center" style={{ color: 'var(--color-text)' }}>
                    <Field
                      type="checkbox"
                      name="remember"
                      className="mr-2"
                    />
                    Remember me
                  </label>
                  <label className="flex items-center" style={{ color: 'var(--color-text)' }}>
                    <input
                      type="checkbox"
                      checked={isAdminLogin}
                      onChange={(e) => setIsAdminLogin(e.target.checked)}
                      className="mr-2"
                    />
                    Login as Admin
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="hover:underline transition-colors duration-300"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Forgot Password?
                  </Link>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-medium py-2.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(to right, var(--color-primary), var(--color-primary-hover))',
                    color: '#fff',
                  }}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }}></div>
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="px-2" style={{ background: 'var(--color-card-bg)', color: 'var(--color-text-muted)' }}>OR</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-8">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                  >
                    <Image
                      width={200}
                      height={200}
                      src="/images/Auth/google.svg"
                      alt="Google"
                      className="w-7 h-7 object-contain"
                    />
                  </button>
                 
                </div>
                <p className="text-center text-xs sm:text-sm mt-4" style={{ color: 'var(--color-text-muted)' }}>
                  Don&apos;t have an account?
                  <Link
                    href="/auth/register"
                    className="hover:underline font-medium transition-colors duration-300"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Register
                  </Link>
                </p>
              </Form>
            )}
          </Formik>

          <InfoMessage message={message} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
