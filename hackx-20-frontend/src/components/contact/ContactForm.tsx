"use client";
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { feedbackTypes } from "@/data/constant";
import { getIssueHandler } from "@/handlers/issueHandler";

const PRIMARY_COLOR = "#228E98";
const GRADIENT_PRIMARY_TO = "#2DC0CE";

// Yup validation schema
const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^\+?[0-9\s()-]{7,20}$/, "Invalid phone number")
    .required("Phone number is required"),
  subject: Yup.string().required("Please select a subject"),
  message: Yup.string()
    .min(10, "Message should be at least 10 characters")
    .required("Message is required"),
});

export default function ContactForm() {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  return (
    <Formik
      initialValues={{
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        subject: "",
        message: "",
      }}
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        setFeedbackMessage(null);
        setIsSuccess(null);

        try {
          const resp = await getIssueHandler(values);

          if (resp.message.message.includes("Success")) {
            setFeedbackMessage(resp.message.message);
            setIsSuccess(true);
            resetForm();
          } else if (resp.message.message.includes("Error")) {
            setFeedbackMessage(resp.message.message);
            setIsSuccess(false);
          } else {
            setFeedbackMessage("Unexpected response from server.");
            setIsSuccess(false);
          }
        } catch (error: any) {
          console.error("Submit error:", error);
          setFeedbackMessage("Error: Something went wrong. Please try again.");
          setIsSuccess(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium mb-1 transition-colors duration-300"
                style={{ color: 'var(--color-text)' }}
              >
                First Name
              </label>
              <Field
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                className="w-full rounded-md border px-3 py-2 transition-colors duration-300"
                style={{ 
                  backgroundColor: 'var(--background)', 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
              <ErrorMessage
                name="firstName"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium mb-1 transition-colors duration-300"
                style={{ color: 'var(--color-text)' }}
              >
                Last Name
              </label>
              <Field
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                className="w-full rounded-md border px-3 py-2 transition-colors duration-300"
                style={{ 
                  backgroundColor: 'var(--background)', 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
              <ErrorMessage
                name="lastName"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
          </div>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1 transition-colors duration-300"
              style={{ color: 'var(--color-text)' }}
            >
              Email
            </label>
            <Field
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full rounded-md border px-3 py-2 transition-colors duration-300"
              style={{ 
                backgroundColor: 'var(--background)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
            <ErrorMessage
              name="email"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>
          {/* Phone Number */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium mb-1 transition-colors duration-300"
              style={{ color: 'var(--color-text)' }}
            >
              Phone Number
            </label>
            <Field
              type="text"
              name="phoneNumber"
              placeholder="+92 300 1234567"
              className="w-full rounded-md border px-3 py-2 transition-colors duration-300"
              style={{ 
                backgroundColor: 'var(--background)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
            <ErrorMessage
              name="phoneNumber"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>
          {/* Type Dropdown */}{" "}
          <div>
            {" "}
            <label
              htmlFor="subject"
              className="block text-sm font-medium mb-1 transition-colors duration-300"
              style={{ color: 'var(--color-text)' }}
            >
              {" "}
              Subject{" "}
            </label>{" "}
            <Field
              as="select"
              name="subject"
              className="w-full px-4 py-2 border rounded-md transition-colors duration-300"
              style={{ 
                backgroundColor: 'var(--background)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              {" "}
              <option disabled={true}> Select Subject </option>{" "}
              {feedbackTypes.map((type, index) => (
                <option key={index} value={type.value}>
                  {" "}
                  {type.label}{" "}
                </option>
              ))}{" "}
            </Field>{" "}
            <ErrorMessage
              name="subject"
              component="p"
              className="text-red-500 text-sm mt-1"
            />{" "}
          </div>
          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium mb-1 transition-colors duration-300"
              style={{ color: 'var(--color-text)' }}
            >
              Message
            </label>
            <Field
              as="textarea"
              name="message"
              placeholder="Write your message here..."
              rows={4}
              className="w-full rounded-md border px-3 py-2 transition-colors duration-300"
              style={{ 
                backgroundColor: 'var(--background)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
            <ErrorMessage
              name="message"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>
          {/* Feedback Message */}
          {feedbackMessage && (
            <div
              className={`p-3 rounded-md text-sm ${
                isSuccess
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {feedbackMessage}
            </div>
          )}
          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 rounded-md text-white font-medium"
              style={{
                background: `linear-gradient(to right, ${PRIMARY_COLOR}, ${GRADIENT_PRIMARY_TO})`,
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
