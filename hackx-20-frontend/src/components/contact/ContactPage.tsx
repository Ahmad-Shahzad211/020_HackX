"use client";
import Image from "next/image";
import Navigation from "../navigation/Navigation";
import Footer from "../footer/Footer";
import ContactForm from "./ContactForm";
export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col relative transition-colors duration-300" style={{ backgroundColor: 'var(--background)' }}>
      {/* Background Image - Same as HomeHero */}
      <div className="absolute inset-0 w-full  z-0">
        <Image
          src="/images/Home/Background.png"
          alt="Background"
          fill
          priority={false}
          className="object-cover opacity-[2] min-h-screen"
        />
      </div>

      {/* Navigation Bar */}
      <Navigation />

      {/* Contact Section */}
      <main className="grow container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen relative z-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-10 transition-colors duration-300" style={{ color: 'var(--color-primary)' }}>
            Contact Us
          </h1>

          {/* Contact Card */}
          <div className="rounded-lg shadow-lg overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
            <div className="flex flex-col lg:flex-row">
              {/* Left Side - Contact Information */}
              <div className=" p-8 lg:p-10 lg:w-1/2  relative">
                <div className="h-full flex flex-col">
                  <h2 className="text-3xl font-semibold mb-3 transition-colors duration-300" style={{ color: 'var(--color-primary)' }}>
                    Contact Information
                  </h2>
                  <p className="mb-8 transition-colors duration-300" style={{ color: 'var(--color-text-muted)' }}>
                    Say something to start a live chat!
                  </p>

                  {/* Vertical line for visual separation (visible only on larger screens) */}
                  <div className="hidden lg:block absolute bottom-20 right-0 w-[1.5px] h-[30rem] transition-colors duration-300" style={{ backgroundColor: 'var(--color-border)' }}></div>

                  <div className="space-y-6 mt-1">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-transparent mr-3 transition-colors duration-300" style={{ borderColor: 'var(--color-primary)', borderWidth: '1px' }}>
                        <svg
                          className="h-5 w-5 transition-colors duration-300"
                          style={{ color: 'var(--color-primary)' }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="mt-2 transition-colors duration-300" style={{ color: 'var(--color-text)' }}>legischat@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Contact Form */}
              <div className="p-8 lg:p-10 lg:w-2/3">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </main>

   
    </div>
  );
}
