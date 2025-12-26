import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { featuresData } from "@/data/constant"; // Adjust path if necessary

gsap.registerPlugin(ScrollTrigger);

const PRIMARY_COLOR = "#228E98"; // This can remain if used by GSAP animations directly in this file
const GRADIENT_PRIMARY_TO = "#2DC0CE"; // This can remain if used by GSAP animations directly in this file

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subHeadingRef = useRef<HTMLParagraphElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const line1Ref = useRef<SVGLineElement>(null);
  const line2Ref = useRef<SVGLineElement>(null);
  const line3Ref = useRef<SVGLineElement>(null);
  const line4Ref = useRef<SVGLineElement>(null);

  useEffect(() => {
    const handleResize = () => {
      // Trigger re-calculation on resize
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(
        ".feature-card-item",
        cardsContainerRef.current
      ) as HTMLElement[];
      const allLineRefs = [line1Ref, line2Ref, line3Ref, line4Ref];
      const lineElements = allLineRefs
        .map((ref) => ref.current)
        .filter(Boolean) as SVGLineElement[];

      // Check screen width - don't apply scroll animations below 450px
      const isLargeScreen = window.matchMedia("(min-width: 450px)").matches;
      const isMediumScreen = window.matchMedia("(min-width: 768px)").matches;

      // SVG line setup only for medium screens and above
      if (lineElements.length === 4 && isMediumScreen && isLargeScreen) {
        lineElements.forEach((line) => {
          gsap.set(line, {
            stroke: PRIMARY_COLOR,
            strokeWidth: 1.5,
          });
        });
      }

      // Create timeline with conditional ScrollTrigger
      const tl = gsap.timeline({
        scrollTrigger: isLargeScreen
          ? {
              trigger: sectionRef.current,
              pin: sectionRef.current,
              pinSpacing: "auto",
              scrub: 1,
              start: "top top",
              end: () => {
                const containerHeight =
                  cardsContainerRef.current?.offsetHeight || window.innerHeight;
                return `+=${(cards.length * containerHeight) / 1.5}`;
              },
              invalidateOnRefresh: true,
            }
          : null,
      });

      // Headline animations
      if (headingRef.current) {
        tl.fromTo(
          headingRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: isLargeScreen ? 0.2 : 0.8 }
        );
      }
      if (subHeadingRef.current) {
        tl.fromTo(
          subHeadingRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: isLargeScreen ? 0.2 : 0.8 },
          isLargeScreen ? "-=0.1" : "-=0.3"
        );
      }

      // SVG line dash setup with proper timing
      gsap.delayedCall(0.1, () => {
        if (lineElements.length === 4 && isMediumScreen && isLargeScreen) {
          lineElements.forEach((line, i) => {
            const length = line.getTotalLength();
            if (length > 0) {
              gsap.set(line, {
                strokeDasharray: length,
                strokeDashoffset: length,
                autoRound: false,
              });
            }
          });
        }
      });

      const cardAnimationDuration = isLargeScreen ? 0.5 : 0.6;
      const lineAnimationDuration = 0.4;
      const cardOffset = 100;

      // Complex animation for large screens with lines
      if (
        cards.length === 4 &&
        lineElements.length === 4 &&
        isMediumScreen &&
        isLargeScreen
      ) {
        // Card 01 (from left)
        tl.fromTo(
          cards[0],
          { opacity: 0, x: -cardOffset },
          {
            opacity: 1,
            x: 0,
            duration: cardAnimationDuration,
            ease: "power2.out",
          },
          "+=0.2"
        );

        // Lines from Card 01
        tl.to(
          lineElements[0],
          {
            strokeDashoffset: 0,
            duration: lineAnimationDuration,
            ease: "power1.inOut",
          },
          `-=${cardAnimationDuration * 0.6}`
        );
        tl.to(
          lineElements[1],
          {
            strokeDashoffset: 0,
            duration: lineAnimationDuration,
            ease: "power1.inOut",
          },
          "<"
        );

        // Card 02 (from top)
        tl.fromTo(
          cards[1],
          { opacity: 0, y: -cardOffset },
          {
            opacity: 1,
            y: 0,
            duration: cardAnimationDuration,
            ease: "power2.out",
          },
          `+=${cardAnimationDuration * 0.3}`
        );

        // Line from Card 02
        tl.to(
          lineElements[2],
          {
            strokeDashoffset: 0,
            duration: lineAnimationDuration,
            ease: "power1.inOut",
          },
          `-=${cardAnimationDuration * 0.6}`
        );

        // Card 03 (from right)
        tl.fromTo(
          cards[2],
          { opacity: 0, x: cardOffset },
          {
            opacity: 1,
            x: 0,
            duration: cardAnimationDuration,
            ease: "power2.out",
          },
          `+=${cardAnimationDuration * 0.3}`
        );

        // Line from Card 03
        tl.to(
          lineElements[3],
          {
            strokeDashoffset: 0,
            duration: lineAnimationDuration,
            ease: "power1.inOut",
          },
          `-=${cardAnimationDuration * 0.6}`
        );

        // Card 04 (from bottom)
        tl.fromTo(
          cards[3],
          { opacity: 0, y: cardOffset },
          {
            opacity: 1,
            y: 0,
            duration: cardAnimationDuration,
            ease: "power2.out",
          },
          `+=${cardAnimationDuration * 0.3}`
        );
      } else if (cards.length > 0) {
        // Simple animation for smaller screens
        tl.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: cardAnimationDuration,
            stagger: isLargeScreen ? 0.2 : 0.15,
            ease: "power2.out",
          },
          "+=0.2"
        );
      }
    }, sectionRef);

    return () => {
      ctx.revert();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const cardPercent = 42;
  const gapPercent = 100 - cardPercent * 2;

  const card1XEnd = cardPercent;
  const card1YEnd = cardPercent;
  const card2XStart = cardPercent + gapPercent;
  const card3YStart = cardPercent + gapPercent;

  const midY1 = cardPercent / 2;
  const midX1 = cardPercent / 2;
  const midY2 = card3YStart + cardPercent / 2;
  const midX2 = card2XStart + cardPercent / 2;

  return (
    <div
      ref={sectionRef}
      className="py-4 xs:py-6 sm:py-8 md:py-12 lg:py-16 xl:py-[8rem] px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 bg-transparent min-h-screen relative z-30 transition-colors duration-300"
      id="features"
    >
      <div className="max-w-7xl mx-auto mb-6 xs:mb-8 sm:mb-10 md:mb-12 lg:mb-16 text-center">
        <h1
          ref={headingRef}
          className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 xs:mb-4 sm:mb-5 md:mb-6 leading-tight transition-colors duration-300"
          style={{ color: 'var(--color-primary)' }}
        >
          Our Features
        </h1>
        <p
          ref={subHeadingRef}
          className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl max-w-xs xs:max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-1 xs:px-2 leading-relaxed transition-colors duration-300"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Whether you're a lawyer or someone needing legal help, Chat-Legis
          makes legal work easier with instant, reliable AI support.
        </p>
      </div>

      <div
        ref={cardsContainerRef}
        className="max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16 relative"
      >
        {/* SVG wrapper - only show on md screens and up */}
        <div className="absolute inset-0 hidden md:block" style={{ zIndex: 5 }}>
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ pointerEvents: "none" }}
          >
            <defs>
              <linearGradient
                id="lineGradientFeatures"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={PRIMARY_COLOR} />
                <stop offset="100%" stopColor={GRADIENT_PRIMARY_TO} />
              </linearGradient>
            </defs>
            <line
              ref={line1Ref}
              x1={card1XEnd}
              y1={midY1}
              x2={card2XStart}
              y2={midY1}
              stroke="url(#lineGradientFeatures)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              ref={line2Ref}
              x1={midX1}
              y1={card1YEnd}
              x2={midX1}
              y2={card3YStart}
              stroke="url(#lineGradientFeatures)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              ref={line3Ref}
              x1={midX2}
              y1={card1YEnd}
              x2={midX2}
              y2={card3YStart}
              stroke="url(#lineGradientFeatures)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              ref={line4Ref}
              x1={card1XEnd}
              y1={midY2}
              x2={card2XStart}
              y2={midY2}
              stroke="url(#lineGradientFeatures)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {featuresData.map((feature) => (
          <div
            key={feature.id}
            className="feature-card-item p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 rounded-lg xs:rounded-xl shadow-md xs:shadow-lg flex flex-col h-full hover:shadow-xl transition-all duration-300 relative z-10"
            style={{ 
              backgroundColor: 'var(--background)', 
              borderColor: 'var(--color-border)',
              borderWidth: '1px'
            }}
          >
            <div className="flex items-center mb-3 xs:mb-4 sm:mb-5 md:mb-6">
              <div className="bg-teal-600 text-white text-sm xs:text-base sm:text-lg md:text-xl font-semibold w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-md xs:rounded-lg mr-2 xs:mr-3 sm:mr-4 md:mr-5 flex-shrink-0">
                <span>{feature.id}</span>
              </div>
              <div className="bg-teal-100 text-teal-700 p-1.5 xs:p-2 sm:p-2.5 md:p-3 rounded-md xs:rounded-lg flex-shrink-0">
                <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8">
                  {feature.icon}
                </div>
              </div>
            </div>
            <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-2 xs:mb-2.5 sm:mb-3 leading-tight transition-colors duration-300" style={{ color: 'var(--color-text)' }}>
              {feature.title}
            </h3>
            <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed flex-grow transition-colors duration-300" style={{ color: 'var(--color-text-muted)' }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
