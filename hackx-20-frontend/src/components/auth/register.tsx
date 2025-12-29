"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaTransgender,
  FaMapMarkerAlt,
  FaCity,
} from "react-icons/fa";
import Select from "react-select";
import { Country, State, City } from "country-state-city";

import { registerHandler } from "@/handlers/regloHandler";
import { UAParser } from "ua-parser-js";
import { useRouter, useSearchParams } from "next/navigation";
import legisStore from "@/store/legisStore";
import InfoMessage from "@/components/Message";
import { getLocation } from "@/utils/clientUtils";

const SignupSchema = Yup.object().shape({
  fullName: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  gender: Yup.string().required("Gender is required"),
  selectedState: Yup.string().required("State is required"),
  selectedCity: Yup.string().required("City is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

// Set Pakistan as default country
const pakistan = Country.getAllCountries().find(
  (country) => country.isoCode === "PK"
);

const pakistanOption = pakistan
  ? {
      value: pakistan.isoCode,
      label: pakistan.name,
      ...pakistan,
    }
  : null;

const pakistanStates = pakistan
  ? State.getStatesOfCountry(pakistan.isoCode).map((state) => ({
      value: state.isoCode,
      label: state.name,
      ...state,
    }))
  : [];
const SignupPage = () => {
  const setEmail = legisStore((state) => state.setEmail);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const route = useRouter();
  const searchParams = useSearchParams();

  const [selectedCountry, setSelectedCountry] = useState(pakistanOption);

  const [stateOptions, setStateOptions] = useState(pakistanStates);

  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);

  const [cityOptions, setCityOptions] = useState<any[]>([]);
  const [formMessage, setFormMessage] = useState("");
  const message = useMemo(() => {
    const error = searchParams.get("error");

    if (!error) return "";

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
        return "An error occurred during authentication.";
    }
  }, [searchParams]);

  const handleGoogleSignup = () => {
    window.location.href = "/api/auth/google";
  };

  const handleFacebookSignup = () => {
    console.log("Facebook signup");
  };

  const handleAppleSignup = () => {
    console.log("Apple signup");
  };

  return (
    <div className="flex justify-center items-center min-h-screen transition-colors duration-300 p-4" style={{ backgroundColor: 'var(--color-card-bg)' }}>
      <div className="w-full max-w-lg">
        <div className="rounded-xl p-6 sm:p-8 w-full shadow-lg transition-colors duration-300" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--color-border)', borderWidth: 1 }}>
          <div className="mb-4 text-start">
            <Link href="/">
              <Image
                src="/chatlegis.svg"
                alt="Reglo Logo"
                width={50}
                height={50}
              />
            </Link>
            <h2 className="text-xl sm:text-2xl font-semibold mt-2 transition-colors duration-300" style={{ color: 'var(--color-primary)' }}>
              Create an account
            </h2>
          </div>

          <Formik
            initialValues={{
              fullName: "",
              email: "",
              gender: "",
              selectedCountry: "PK",
              selectedState: "",
              selectedCity: "",
              password: "",
              ipAddress: "",
              city: "",
              country: "Pakistan",
              browser: "",
              browserVersion: "",
              osName: "",
            }}
            validationSchema={SignupSchema}
            onSubmit={async (values) => {
              try {
                const locationInfo = await getLocation();

                const userAgent = navigator.userAgent;
                const devices = UAParser(userAgent);
                values.browser = devices.browser.name || "";
                values.browserVersion = devices.browser.version || "";
                values.osName = devices.os.name || "";
                values.ipAddress = locationInfo.ip;
                values.city = selectedCity?.name || "";
                values.country = selectedCountry?.name || "";

                const resp = await registerHandler(values);

                setFormMessage(resp.message);
                setEmail(values.email);
                setTimeout(() => route.push("/auth/verify-otp"), 7000);
              } catch (error: any) {
                if (error.status == 409) {
                  setFormMessage("User Already Exists!");
                } else {
                  setFormMessage("Unknown Error occured!");
                }
              }
            }}
          >
            {({ isSubmitting, setFieldValue }) => {
              // Get all countries
              const countryOptions = Country.getAllCountries().map(
                (country) => ({
                  value: country.isoCode,
                  label: country.name,
                  ...country,
                })
              );

              // Handle country change
              const handleCountryChange = (option: any) => {
                setSelectedCountry(option);
                setFieldValue("selectedCountry", option?.value || "");
                setSelectedState(null);
                setSelectedCity(null);
                setFieldValue("selectedState", "");
                setFieldValue("selectedCity", "");

                if (option) {
                  const states = State.getStatesOfCountry(option.value).map(
                    (state) => ({
                      value: state.isoCode,
                      label: state.name,
                      ...state,
                    })
                  );
                  setStateOptions(states);
                } else {
                  setStateOptions([]);
                }
                setCityOptions([]);
              };

              // Handle state change
              const handleStateChange = (option: any) => {
                setSelectedState(option);
                setFieldValue("selectedState", option?.value || "");
                setSelectedCity(null);
                setFieldValue("selectedCity", "");

                if (option && selectedCountry) {
                  const cities = City.getCitiesOfState(
                    selectedCountry.value,
                    option.value
                  ).map((city) => ({
                    value: city.name,
                    label: city.name,
                    ...city,
                  }));
                  setCityOptions(cities);
                } else {
                  setCityOptions([]);
                }
              };

              // Handle city change
              const handleCityChange = (option: any) => {
                setSelectedCity(option);
                setFieldValue("selectedCity", option?.value || "");
              };

              return (
                <Form className="space-y-4">
                  {/* Name */}
                  <div>
                    <div className="flex items-center px-4 py-3 rounded-lg w-full" style={{ backgroundColor: 'var(--color-input-bg)' }}>
                      <FaUser className="mr-2" style={{ color: 'var(--color-text-muted)' }} />
                      <Field
                        type="text"
                        name="fullName"
                        placeholder="Enter your name"
                        className="bg-transparent outline-none w-full"
                        style={{ color: 'var(--color-text)' }}
                      />
                    </div>
                    <ErrorMessage
                      name="fullName"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <div className="flex items-center px-4 py-3 rounded-lg w-full" style={{ backgroundColor: 'var(--color-input-bg)' }}>
                      <FaEnvelope className="mr-2" style={{ color: 'var(--color-text-muted)' }} />
                      <Field
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        className="bg-transparent outline-none w-full"
                        style={{ color: 'var(--color-text)' }}
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <div className="flex items-center px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--color-input-bg)' }}>
                      <FaTransgender className="mr-2" style={{ color: 'var(--color-text-muted)' }} />
                      <Field
                        as="select"
                        name="gender"
                        className="bg-transparent outline-none w-full"
                        style={{ color: 'var(--color-text)' }}
                      >
                        <option value="">Select a gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Field>
                    </div>
                    <ErrorMessage
                      name="gender"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* State and City */}
                  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                    {/* State */}
                    <div className="w-full sm:w-1/2">
                      <div className="flex items-center px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--color-input-bg)' }}>
                        <FaMapMarkerAlt className="mr-2 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                        <div className="w-full">
                          <Select
                            options={stateOptions}
                            value={selectedState}
                            onChange={handleStateChange}
                            placeholder="Select a state"
                            isClearable
                            isDisabled={!selectedCountry}
                            styles={{
                              control: (base) => ({
                                ...base,
                                border: "none",
                                background: "transparent",
                                boxShadow: "none",
                                minHeight: "20px",
                              }),
                              valueContainer: (base) => ({
                                ...base,
                                padding: "0",
                              }),
                              input: (base) => ({
                                ...base,
                                margin: "0",
                                padding: "0",
                                color: "#6B7280",
                              }),
                              singleValue: (base) => ({
                                ...base,
                                color: "#6B7280",
                              }),
                              placeholder: (base) => ({
                                ...base,
                                color: "#6B7280",
                              }),
                              option: (base, state) => ({
                                ...base,
                                color: "#6B7280",
                                backgroundColor: state.isFocused
                                  ? "#E5E7EB"
                                  : "white",
                              }),
                              indicatorSeparator: () => ({
                                display: "none",
                              }),
                              dropdownIndicator: (base) => ({
                                ...base,
                                padding: "0 4px",
                                color: "#6B7280",
                              }),
                            }}
                          />
                        </div>
                      </div>
                      <ErrorMessage
                        name="selectedState"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>

                    {/* City */}
                    <div className="w-full sm:w-1/2">
                      <div className="flex items-center px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--color-input-bg)' }}>
                        <FaCity className="mr-2 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                        <div className="w-full">
                          <Select
                            options={cityOptions}
                            value={selectedCity}
                            onChange={handleCityChange}
                            placeholder="Select a city"
                            isClearable
                            isDisabled={!selectedState}
                            styles={{
                              control: (base) => ({
                                ...base,
                                border: "none",
                                background: "transparent",
                                boxShadow: "none",
                                minHeight: "20px",
                              }),
                              valueContainer: (base) => ({
                                ...base,
                                padding: "0",
                              }),
                              input: (base) => ({
                                ...base,
                                margin: "0",
                                padding: "0",
                                color: "#6B7280",
                              }),
                              singleValue: (base) => ({
                                ...base,
                                color: "#6B7280",
                              }),
                              placeholder: (base) => ({
                                ...base,
                                color: "#6B7280",
                              }),
                              option: (base, state) => ({
                                ...base,
                                color: "#6B7280",
                                backgroundColor: state.isFocused
                                  ? "#E5E7EB"
                                  : "white",
                              }),
                              indicatorSeparator: () => ({
                                display: "none",
                              }),
                              dropdownIndicator: (base) => ({
                                ...base,
                                padding: "0 4px",
                                color: "#6B7280",
                              }),
                            }}
                          />
                        </div>
                      </div>
                      <ErrorMessage
                        name="selectedCity"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--color-input-bg)' }}>
                      <FaLock className="mr-2" style={{ color: 'var(--color-text-muted)' }} />
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter Password"
                        className="bg-transparent outline-none w-full"
                        style={{ color: 'var(--color-text)' }}
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
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <div className="flex items-center px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--color-input-bg)' }}>
                      <FaLock className="mr-2" style={{ color: 'var(--color-text-muted)' }} />
                      <Field
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        className="bg-transparent outline-none w-full"
                        style={{ color: 'var(--color-text)' }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <FaEyeSlash style={{ color: 'var(--color-text-muted)' }} />
                        ) : (
                          <FaEye style={{ color: 'var(--color-text-muted)' }} />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="confirmPassword"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full font-medium py-2.5 sm:py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(to right, var(--color-primary), var(--color-primary-hover))',
                      color: '#fff',
                    }}
                  >
                    {isSubmitting ? "Signing up..." : "Sign Up"}
                  </button>

                  {/* OR separator */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }}></div>
                    </div>
                    <div className="relative flex justify-center text-xs sm:text-sm">
                      <span className="px-2" style={{ background: 'var(--color-card-bg)', color: 'var(--color-text-muted)' }}>OR</span>
                    </div>
                  </div>

                  {/* Google Signup */}
                  <div className="flex items-center justify-center gap-8">
                    <button
                      type="button"
                      onClick={handleGoogleSignup}
                    >
                      <Image
                        width={200}
                        height={200}
                        src="/images/Auth/google.svg"
                        alt="Google"
                        className="w-7 h-7"
                      />
                    </button>
                    
                  </div>

                  {/* Redirect to Login */}
                  <p className="text-center text-sm mt-4" style={{ color: 'var(--color-text-muted)' }}>
                    Already have an account?
                    <Link
                      href="/auth/login"
                      className="hover:underline font-medium transition-colors duration-300"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Login
                    </Link>
                  </p>
                </Form>
              );
            }}
          </Formik>
          <InfoMessage message={message || formMessage} />
        </div>
      </div>
    </div>
  );
};
export default SignupPage;
