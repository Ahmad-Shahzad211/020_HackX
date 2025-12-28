"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { MessageSquare, Send, AlertCircle, CheckCircle } from "lucide-react";
import BreadCrumbs from "@/components/breadcrumbs";
import { feedbackTypes } from "@/data/constant";
import { feedbackHandler } from "../../handlers/feedback";
import { useState } from "react";

export default function FeedbackPage() {
  const initialValues = {
    type: "",
    details: "",
  };
  const [message, setMessage] = useState("");
  const validationSchema = Yup.object({
    type: Yup.string().required("Please select a type"),
    details: Yup.string()
      .required("Full details are required")
      .min(10, "Details should be at least 10 characters long"),
  });

  const handleSubmit = async (values: any) => {
    try {
      const response = await feedbackHandler(values);

      if (response?.status == 200) {
        setMessage(response.message.message);
      } else if (response.status == 401) {
        setMessage(response.message);
      } else if (response.status == 409) {
        setMessage(response.message);
      } else if (response.status == 404) {
        setMessage(response.message);
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setTimeout(() => setMessage(""), 7000);
    }
  };

  return (
    <div
      className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100"
      id="feedback"
    >
      <main className="flex flex-col">
        {/* Enhanced Breadcrumbs */}

        <BreadCrumbs page={"Feedback"} />

        {/* Main Content */}
        <div className="flex-1 p-2 sm:p-4 lg:p-6">
          <div className="bg-linear-to-br from-[#A0D2DB] via-[#7FB8C3] to-[#329898] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
            <div className="scroll-container p-4 sm:p-6 lg:p-8 max-h-[calc(100vh-120px)] overflow-y-auto">
              {/* Header Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Share Your Feedback
                </h1>
                <p className="text-white/80 text-sm sm:text-base max-w-2xl mx-auto">
                  Help us improve by sharing your thoughts, reporting issues, or
                  suggesting new features.
                </p>
              </div>

              {/* Form Container */}
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 shadow-xl">
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ isSubmitting, values, errors, touched }) => (
                      <Form className="space-y-6">
                        {/* Type Selection */}
                        <div>
                          <label className="block text-white font-semibold text-lg mb-4">
                            Choose one of the options from below
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {feedbackTypes.map((type) => {
                              const Icon = type.icon;
                              return (
                                <label
                                  key={type.value}
                                  className={`
                                    relative cursor-pointer group transition-all duration-300
                                    ${
                                      values.type === type.value
                                        ? "scale-105 shadow-lg"
                                        : "hover:scale-102 hover:shadow-md"
                                    }
                                  `}
                                >
                                  <Field
                                    type="radio"
                                    name="type"
                                    value={type.value}
                                    className="sr-only"
                                  />
                                  <div
                                    className={`
                                      p-4 rounded-xl border-2 transition-all duration-300
                                      ${
                                        values.type === type.value
                                          ? "bg-white/20 border-white/40 shadow-lg"
                                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                      }
                                    `}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div
                                        className={`p-2 rounded-lg bg-linear-to-r ${type.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                      >
                                        <Icon className="w-5 h-5 text-white" />
                                      </div>
                                      <div>
                                        <div className="font-semibold text-white text-sm sm:text-base">
                                          {type.label}
                                        </div>
                                      </div>
                                    </div>
                                    {values.type === type.value && (
                                      <div className="absolute top-2 right-2">
                                        <CheckCircle className="w-5 h-5 text-white" />
                                      </div>
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                          <ErrorMessage
                            name="type"
                            component="div"
                            className="text-red-200 text-sm mt-2 flex items-center gap-1"
                          >
                            {(msg) => (
                              <>
                                <AlertCircle className="w-4 h-4" />
                                {msg}
                              </>
                            )}
                          </ErrorMessage>
                        </div>

                        {/* Details Section */}
                        <div>
                          <label
                            htmlFor="details"
                            className="block text-white font-semibold text-lg mb-3"
                          >
                            Tell us more details
                          </label>
                          <div className="relative">
                            <Field
                              as="textarea"
                              name="details"
                              rows={6}
                              placeholder="Please describe in detail... The more information you provide, the better we can help you."
                              className={`
                                w-full p-4 bg-white/10 backdrop-blur-sm border-2 rounded-xl 
                                text-white placeholder-white/90 resize-none transition-all duration-300
                                focus:bg-white/15 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20
                                ${
                                  errors.details && touched.details
                                    ? "border-red-300/50 focus:border-red-300/70"
                                    : "border-white/20 hover:border-white/30"
                                }
                              `}
                            />
                            <div className="absolute bottom-3 right-3 text-white/50 text-xs">
                              {values.details.length}/500
                            </div>
                          </div>
                          <ErrorMessage
                            name="details"
                            component="div"
                            className="text-red-200 text-sm mt-2 flex items-center gap-1"
                          >
                            {(msg) => (
                              <>
                                <AlertCircle className="w-4 h-4" />
                                {msg}
                              </>
                            )}
                          </ErrorMessage>
                        </div>

                        {/* Divider */}
                        <div className="relative my-8">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                          </div>
                        </div>
                        {message.length > 0 && (
                          <div
                            className={`message ${
                              message.includes("Success!")
                                ? "bg-green-500"
                                : "bg-red-500"
                            } text-white p-3 rounded-md`}
                          >
                            {message}
                          </div>
                        )}

                        {/* Submit Section */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                          <div className="text-white/70 text-sm">
                            Your feedback helps us improve our platform
                          </div>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`
                              group relative px-8 py-3 bg-linear-to-r from-white/20 to-white/10 
                              backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30
                              transition-all duration-300 hover:scale-105 hover:shadow-lg
                              focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent
                              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                              min-w-35 flex items-center justify-center gap-2
                              `}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                Submit Feedback
                              </>
                            )}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
