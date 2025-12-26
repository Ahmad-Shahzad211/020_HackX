"use client";
import { useRef, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field } from "formik";
import Image from "next/image";
import { resendOTP, validateOTP } from "@/handlers/regloHandler";
import legisStore from "@/store/legisStore";
import Link from "next/link";
import InfoMessage from "@/components/Message";
import * as Yup from "yup";

// Add this validation schema
const otpValidationSchema = Yup.object().shape({
  otp: Yup.array()
    .of(Yup.string().matches(/^\d$/, "Must be a digit"))
    .length(6, "OTP must be exactly 6 digits")
    .test("is-valid-otp", "OTP must contain only digits", (value) =>
      value?.every((digit) => digit !== undefined && /^\d$/.test(digit))
    ),
});

const OTPVerificationPage = ({
  showOTP,
  setNewPasswordForm,
}: {
  showOTP?: any;
  setNewPasswordForm?: any;
}) => {
  const email = legisStore((state) => state.email);
  const [timer, setTimer] = useState<number>(0);
  const [resend, setResend] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const route = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requiresOTP = searchParams.get("requiresOTP");

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace" && index > 0 && !event.currentTarget.value) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLDivElement>,
    setFieldValue: any
  ) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const otpArray = pasteData.split("");
      otpArray.forEach((digit, index) => {
        if (index < 6) {
          setFieldValue(`otp[${index}]`, digit);
          if (index < 5) {
            inputRefs.current[index + 1]?.focus();
          }
        }
      });
    }
  };

  const handleResend = async () => {
    try {
      setResend(true);
      const res = await resendOTP(email);

      setMessage(res.data.message);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    const countdown = () => {
      if (timer < 30 && resend) {
        setTimer(timer + 1);
      } else {
        setResend(false);
        setTimer(0);
      }
    };
    const interval = setInterval(countdown, 1000);
    return () => clearInterval(interval);
  });
  if (email.length <= 0) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              You are not authorized to visit this page.
            </h1>
            <p className="text-lg text-gray-600">
              Go back to{" "}
              <Link
                href="/auth/register"
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </>
    );
  }
  return (
    <div className="flex justify-center items-center min-h-screen transition-colors duration-300 p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-lg">
        <div className="rounded-xl p-4 sm:p-6 lg:p-8 w-full lg:w-[85%] shadow-lg transition-colors duration-300" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-border)', borderWidth: 1 }}>
          <div className="mb-8 text-center">
            <Link href="/">
              <Image
                src="/chatlegis.svg"
                alt="Reglo Logo"
                width={50}
                height={10}
              />
            </Link>
            <h2 className="text-xl sm:text-2xl font-semibold mt-2 transition-colors duration-300" style={{ color: 'var(--color-primary)' }}>
              Verify OTP
            </h2>
            <p className="text-sm mt-2 transition-colors duration-300" style={{ color: 'var(--color-text-muted)' }}>
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <Formik
            initialValues={{ otp: ["", "", "", "", "", ""] }}
            validationSchema={otpValidationSchema}
            onSubmit={async (values) => {
              setSubmitting(true);
              const value = {
                email: email,
                otp: values.otp.join(""),
                verifyOTP: requiresOTP,
              };
              try {
                const resp = await validateOTP(value);
                if (pathname.includes("forgot")) {
                  if (resp.status === 200) {
                    showOTP(false);
                    setNewPasswordForm(true);
                  } else {
                    setMessage(resp.data.message);
                  }
                } else {
                  if (resp.status === 200) {
                    setMessage(resp.data.message);
                    route.push("/auth/login");
                  }
                }
              } catch (error: any) {
                setMessage(error.message);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ setFieldValue }) => (
              <Form>
                <div
                  className="mb-8"
                  onPaste={(e) => handlePaste(e, setFieldValue)}
                >
                  <div className="flex justify-center gap-2 sm:gap-3 md:gap-4">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <div key={index} className="relative">
                        <Field
                          name={`otp[${index}]`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          className="w-11 h-14 sm:w-12 sm:h-16 md:w-14 md:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all duration-200 shadow-sm"
                          style={{
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                            backgroundColor: 'var(--color-input-bg)',
                          }}
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>
                          ) => handleKeyDown(e, index)}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const value = e.target.value;
                            if (/^\d?$/.test(value)) {
                              setFieldValue(`otp[${index}]`, value);
                              if (value && index < 5) {
                                inputRefs.current[index + 1]?.focus();
                              }
                            }
                          }}
                          innerRef={(el: HTMLInputElement) =>
                            (inputRefs.current[index] = el)
                          }
                        />
                        {index < 5 && (
                          <div className="hidden sm:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-gray-300">
                            •
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
                    Paste your 6-digit OTP above
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-3 sm:space-y-0">
                  <div className="flex items-center">
                    <button
                      type="button"
                      className={`flex items-center ${
                        resend
                          ? "cursor-not-allowed"
                          : "hover:underline"
                      } text-sm font-medium transition-colors duration-200`}
                      style={{ color: resend ? 'var(--color-text-muted)' : 'var(--color-primary)' }}
                      onClick={handleResend}
                      disabled={resend}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
                      </svg>
                      Resend Code
                    </button>
                  </div>

                  {resend && (
                    <div className="flex items-center">
                      <div className="w-20 h-5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-input-bg)' }}>
                        <div
                          className="h-full transition-all duration-1000 ease-linear"
                          style={{ width: `${(timer / 30) * 100}%`, backgroundColor: 'var(--color-primary)' }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm min-w-7.5" style={{ color: 'var(--color-text-muted)' }}>
                        {timer}s
                      </span>
                    </div>
                  )}
                </div>

                <button
                  disabled={submitting}
                  type="submit"
                  className="w-full font-medium py-3 px-4 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(to right, var(--color-primary), var(--color-primary-hover))',
                    color: '#fff',
                  }}
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>Verify Code</>
                  )}
                </button>
              </Form>
            )}
          </Formik>
          <InfoMessage message={message} />
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
