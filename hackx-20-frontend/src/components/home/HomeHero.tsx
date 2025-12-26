"use client";
import Link from "next/link";
import Image from "next/image"; // For static SVGs
import Navigation from "../navigation/Navigation";
import Footer from "../footer/Footer";
import Features from "../Features/features";
import Pricing from "../pricings/pricing";
import FAQs from "../FAQs/FAQs";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Testimonials from "../testmonails/testimonial";
import Stats from "../Stats/stats";

gsap.registerPlugin(ScrollTrigger);

const PRIMARY_COLOR = "#228E98";
const PRIMARY_COLOR_HOVER = "#1b7078";
const GRADIENT_PRIMARY_TO = "#2DC0CE";

export default function HomeHero() {
  const heroHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const heroParagraphRef = useRef<HTMLParagraphElement | null>(null);
  const heroButtonRef = useRef<HTMLAnchorElement | null>(null);
  const heroImageContainerRef = useRef<HTMLDivElement | null>(null);

  const gavelObjectRef = useRef<HTMLObjectElement | null>(null);
  const scaleObjectRef = useRef<HTMLObjectElement | null>(null);

  useEffect(() => {
    const commonScrollTriggerConfig = {
      start: "top 80%",
      toggleActions: "play none none none",
    };

    // Text & Button Animations
    if (heroHeadingRef.current) {
      gsap.fromTo(
        heroHeadingRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: heroHeadingRef.current,
            ...commonScrollTriggerConfig,
          },
        }
      );
    }
    if (heroParagraphRef.current) {
      gsap.fromTo(
        heroParagraphRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2,
          scrollTrigger: {
            trigger: heroParagraphRef.current,
            ...commonScrollTriggerConfig,
          },
        }
      );
    }
    if (heroButtonRef.current) {
      gsap.fromTo(
        heroButtonRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          delay: 0.4,
          scrollTrigger: {
            trigger: heroButtonRef.current,
            ...commonScrollTriggerConfig,
          },
        }
      );
    }

    // Entrance for the whole image container and static SVGs
    if (heroImageContainerRef.current) {
      gsap.fromTo(
        heroImageContainerRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          delay: 0.3,
          scrollTrigger: {
            trigger: heroImageContainerRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
      gsap.fromTo(
        ["#document-svg-img", "#court-svg-img"],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.2,
          delay: 0.4,
          scrollTrigger: {
            trigger: heroImageContainerRef.current,
            start: "top 80%",
          },
        }
      );
    }

    // Entrance for Gavel <object> (animating the whole object initially)
    if (gavelObjectRef.current) {
      gsap.fromTo(
        gavelObjectRef.current,
        { y: -30, opacity: 0, rotate: 0 /* Initial rotation for entrance */ },
        {
          y: 0,
          opacity: 1,
          rotate: 0,
          duration: 1,
          ease: "elastic.out(1, 0.5)",
          delay: 0.5,
          scrollTrigger: {
            trigger: heroImageContainerRef.current,
            start: "top 80%",
          },
        }
      );
    }

    // Entrance for Scale <object> (animating the whole object initially)
    if (scaleObjectRef.current) {
      gsap.fromTo(
        scaleObjectRef.current,
        { scale: 0.7, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          delay: 0.6,
          scrollTrigger: {
            trigger: heroImageContainerRef.current,
            start: "top 80%",
          },
        }
      );
    }

    // --- Animations for INNER parts of Gavel and Scale ---
    const gavelObj = gavelObjectRef.current;
    const scaleObj = scaleObjectRef.current;

    const setupGavelAnimation = () => {
      if (!gavelObj || !heroImageContainerRef.current) return;
      const svgDoc = gavelObj.contentDocument;
      if (svgDoc) {
        const gavelHammer = svgDoc.getElementById(
          "gavel-hammer-anim"
        ) as SVGGElement | null; // Target the <g> or <path> for the hammer
        // const gavelPad = svgDoc.getElementById('gavel-pad-static'); // Not animated, but good to know it exists

        if (gavelHammer) {
          gsap.to(gavelHammer, {
            rotate: 20, // Angle of rotation for the striking motion
            duration: 0.35,
            ease: "power1.inOut",
            yoyo: true,
            repeat: -1,
            repeatDelay: 0.5,
            delay: 1.5, // Delay after the main gavel entrance
            // ** CRITICAL: ADJUST THIS TRANSFORM ORIGIN **
            // This should be the point where the hammer's handle pivots.
            // Examples: "0% 100%" (bottom-left of hammer), "10% 90%", "center 85%"
            // You will need to experiment with values like "x% y%" or "xValue yValue"
            transformOrigin: "90% 100%", // <<<<<<< ADJUST THIS FOR YOUR HAMMER'S PIVOT
            scrollTrigger: {
              trigger: heroImageContainerRef.current,
              start: "top 70%",
              end: "bottom top",
              toggleActions: "play pause resume pause",
            },
          });
        } else {
          console.warn(
            "Element with ID 'gavel-hammer-anim' not found in gavel.svg. Ensure SVG is edited correctly."
          );
        }
      } else {
        console.warn("gavel.svg contentDocument is null.");
      }
    };

    const handleGavelError = (event: Event) =>
      console.error("Error loading gavel.svg:", event, gavelObj?.data);

    if (gavelObj) {
      if (
        gavelObj.contentDocument &&
        gavelObj.contentDocument.readyState === "complete"
      )
        setupGavelAnimation();
      else {
        gavelObj.addEventListener("load", setupGavelAnimation);
        gavelObj.addEventListener("error", handleGavelError);
      }
    }

    const setupScaleAnimation = () => {
      if (!scaleObj || !heroImageContainerRef.current) return;
      const svgDoc = scaleObj.contentDocument;
      if (svgDoc) {
        const scaleinner = svgDoc.getElementById(
          "scale-icon-internal"
        ) as SVGGElement | null;

        gsap.to(scaleinner, {
          rotation: 3,
          duration: 1.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          transformOrigin: "50% 50%",
          delay: 2, // gives some time after initial entrance
          scrollTrigger: {
            trigger: heroImageContainerRef.current,
            start: "top 70%",
            end: "bottom 70%",
            toggleActions: "play pause resume pause",
          },
        });
      } else {
        console.warn("scale.svg contentDocument is null.");
      }
    };

    const handleScaleError = (event: Event) =>
      console.error("Error loading scale.svg:", event, scaleObj?.data);

    if (scaleObj) {
      if (
        scaleObj.contentDocument &&
        scaleObj.contentDocument.readyState === "complete"
      )
        setupScaleAnimation();
      else {
        scaleObj.addEventListener("load", setupScaleAnimation);
        scaleObj.addEventListener("error", handleScaleError);
      }
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      if (gavelObj) {
        gavelObj.removeEventListener("load", setupGavelAnimation);
        gavelObj.removeEventListener("error", handleGavelError);
      }
      if (scaleObj) {
        scaleObj.removeEventListener("load", setupScaleAnimation);
        scaleObj.removeEventListener("error", handleScaleError);
      }
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col relative bg-[var(--background)] transition-colors duration-300"
      style={{
        backgroundImage: "url('/images/Home/Background.png')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
      }}
    >
      <Navigation />
      <main className="flex-grow container mx-auto flex flex-col lg:flex-row items-center justify-center px-3 lg:px-16 py-12 lg:py-0">
        <div className="lg:w-2/3 text-center lg:text-left mb-16 lg:mb-0">
          <h1
            ref={heroHeadingRef}
            className="text-4xl md:text-6xl font-medium mb-6 text-[var(--color-text)] transition-colors duration-300"
          >
            Your Smart Legal Assistant <br />{" "}
            <span className="text-[var(--color-primary)] transition-colors duration-300">for Pakistani,</span> Law.
          </h1>
          <p
            ref={heroParagraphRef}
            className="text-lg sm:text-xl md:text-2xl text-[var(--color-text-muted)] mb-10 max-w-xl mx-auto lg:mx-0 transition-colors duration-300"
          >
            Draft contracts, prepare cases, and get to know the latest legal
            laws, all in one place. Fast, accurate, and designed for lawyers,
            judges, and citizens.
          </p>
          <Link
            href="/cl/chatscreen"
            ref={heroButtonRef}
            className="inline-block text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 md:px-8 md:py-4 rounded-full shadow-xl hover:shadow-2xl transition-all text-base sm:text-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
          >
            Try it Now
          </Link>
        </div>

        <div
          ref={heroImageContainerRef}
          className="w-full lg:w-[40%] flex items-center justify-center relative"
        >
          <div className="relative w-[500px] sm:w-[500px] h-[500px] lg:w-[546px] lg:h-[700px]">
            <Image
              id="document-svg-img"
              src="/images/Home/document.svg"
              alt="Legal document icon"
              fill
              style={{
                objectFit: "contain",
                position: "absolute",
                top: 0,
                left: 0,
              }}
              priority
            />
            <object
              ref={scaleObjectRef}
              id="scale-svg-obj"
              type="image/svg+xml"
              data="/images/Home/scale.svg"
              aria-label="Animated scales of justice icon"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                pointerEvents: "none",
              }}
            />
            <Image
              id="court-svg-img"
              src="/images/Home/court.svg"
              alt="Courthouse icon"
              fill
              style={{
                objectFit: "contain",
                position: "absolute",
                top: 0,
                left: 0,
              }}
              priority
            />
            <object
              ref={gavelObjectRef}
              id="gavel-svg-obj"
              type="image/svg+xml"
              data="/images/Home/gavel.svg"
              aria-label="Animated gavel icon"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      </main>
      <Features />
      <Pricing />
      <Testimonials />
      <Stats />
      <FAQs />
    </div>
  );
}
