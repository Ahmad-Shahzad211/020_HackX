"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { FaLock, FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import LegalQuotes from "@/components/LegalQuotes";
import { newPasswordHandler } from "@/handlers/regloHandler";
import InfoMessage from "@/components/Message";
import { useRouter } from "next/navigation";

const ChangePasswordPage = ({ email }: { email: string }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordValidations, setPasswordValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false,
  });
  const route = useRouter();

  useEffect(() => {
    // Validate password whenever it changes
    setPasswordValidations({
      minLength: newPassword.length >= 8,
      hasUpperCase: /[A-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      passwordsMatch: newPassword === confirmPassword && newPassword !== "",
    });
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if all validations pass
    const allValid = Object.values(passwordValidations).every(Boolean);
    if (!allValid) {
      setMessage("Please ensure your password meets all requirements");
      return;
    }

    try {
      const value = {
        email: email,
        password: newPassword,
      };
      setSubmitting(true);
      const resp = await newPasswordHandler(value);

      setMessage(resp.message.message);
      setTimeout(() => route.push("/auth/login"), 7000);
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const ValidationItem = ({
    valid,
    text,
  }: {
    valid: boolean;
    text: string;
  }) => (
    <li className="flex items-center">
      {valid ? (
        <FaCheck className="text-green-500 mr-2" />
      ) : (
        <FaTimes className="text-red-500 mr-2" />
      )}
      <span className={valid ? "text-green-500" : "text-gray-600"}>{text}</span>
    </li>
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-white p-4">
      <div className="w-full min-w-78.75 max-w-350 min-h-150 lg:h-200 bg-white overflow-hidden flex flex-col lg:flex-row">
        {/* Left Half - Image */}
        <div className="hidden sm:block w-full lg:w-1/2 relative h-75 lg:h-full">
          <Image
            src="/images/Auth/login-signup.jpg"
            alt="Change password visual"
            layout="fill"
            objectFit="cover"
            className="rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none"
            priority
          />
          <div className="block">
            <LegalQuotes />
          </div>
        </div>

        {/* Right Half - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 w-full lg:w-[85%] shadow-[0_10px_30px_#228E98]">
            <div className="mb-6 text-start">
              <h1 className="text-xl sm:text-2xl font-bold text-[#228E98]">
                Logo
              </h1>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#228E98] mt-2">
                Create New Password
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Your new password must be different from previous used passwords
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center px-4 py-3 bg-gray-100 rounded-lg">
                <FaLock className="mr-2 text-gray-500" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-transparent outline-none w-full text-gray-500 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="focus:outline-none"
                >
                  {showNewPassword ? (
                    <FaEyeSlash className="text-gray-500" />
                  ) : (
                    <FaEye className="text-gray-500" />
                  )}
                </button>
              </div>

              <div className="flex items-center px-4 py-3 bg-gray-100 rounded-lg">
                <FaLock className="mr-2 text-gray-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-transparent outline-none w-full text-gray-500 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="text-gray-500" />
                  ) : (
                    <FaEye className="text-gray-500" />
                  )}
                </button>
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <p>Password must contain:</p>
                <ul className="space-y-1 pl-1">
                  <ValidationItem
                    valid={passwordValidations.minLength}
                    text="At least 8 characters"
                  />
                  <ValidationItem
                    valid={passwordValidations.hasUpperCase}
                    text="At least one uppercase letter"
                  />
                  <ValidationItem
                    valid={passwordValidations.hasNumber}
                    text="At least one number"
                  />
                  <ValidationItem
                    valid={passwordValidations.hasSpecialChar}
                    text="At least one special character"
                  />
                  <ValidationItem
                    valid={passwordValidations.passwordsMatch}
                    text="Passwords match"
                  />
                </ul>
              </div>

              <button
                disabled={isSubmitting}
                type="submit"
                className={`w-full py-2.5 sm:py-3 ${
                  isSubmitting
                    ? "bg-gray-300"
                    : "bg-gradient-primary hover:bg-[#1a7b85]"
                }   text-white font-medium rounded-lg text-sm sm:text-base mt-4`}
              >
                {isSubmitting ? "Changing Password" : "Change Password"}
              </button>
            </form>
            <InfoMessage message={message} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChangePasswordPage;
