"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Star, Sparkles, ChevronRight } from "lucide-react";
import { pricingTiers } from "@/data/constant";

gsap.registerPlugin(ScrollTrigger);

const Pricing: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState(2); // Default to Yearly (index 2)
  const pricingCardRef = useRef<HTMLDivElement>(null);
  const pricingListRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (pricingCardRef.current && pricingListRef.current) {
      gsap.fromTo(
        [pricingCardRef.current, pricingListRef.current],
        {
          opacity: 0,
          y: 80,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: pricingCardRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const handleTierSelection = (index: number) => {
    if (isAnimatingRef.current || index === selectedTier) return;
    isAnimatingRef.current = true;

    const card = pricingCardRef.current;
    if (!card) return;

    gsap.to(card, {
      opacity: 0,
      x: 20,
      scale: 0.98,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        setSelectedTier(index);
        gsap.fromTo(
          card,
          { opacity: 0, x: -20, scale: 0.98 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.3,
            ease: "back.out(1.4)",
            onComplete: () => {
              isAnimatingRef.current = false;
            },
          }
        );
      },
    });
  };

  const currentTier = pricingTiers[selectedTier];

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--color-card-bg)' }}
    id="pricing">
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Transparent Pricing
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance transition-colors duration-300" style={{ color: 'var(--color-text)' }}>
            Pick the price that's{" "}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              right for you
            </span>
          </h2>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed transition-colors duration-300" style={{ color: 'var(--color-text-muted)' }}>
            Flexible pricing tailored to your needs, whether you're just
            starting out or scaling up your operations
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          {/* Pricing Options List */}
          <div ref={pricingListRef} className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-8 transition-colors duration-300" style={{ color: 'var(--color-text)' }}>
              Choose Your Plan
            </h3>
            <div className="space-y-3">
              {pricingTiers.map((tier, index) => (
                <button
                  key={index}
                  onClick={() => handleTierSelection(index)}
                  className={`w-full text-left p-6 rounded-2xl transition-all duration-300 group ${
                    selectedTier === index
                      ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25"
                      : "backdrop-blur-sm hover:shadow-md"
                  }`}
                  style={selectedTier !== index ? {
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--color-border)',
                    borderWidth: '1px',
                    color: 'var(--color-text)'
                  } : {}}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{tier.name}</h4>
                        {tier.highlighted && (
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedTier === index
                                ? "bg-white/20 text-white"
                                : "bg-teal-100 text-teal-700"
                            }`}
                          >
                            <Star className="w-3 h-3 inline mr-1" />
                            Popular
                          </div>
                        )}
                      </div>
                      {tier.price ? (
                        <div
                          className={`text-2xl font-bold ${
                            selectedTier === index
                              ? "text-white"
                              : "text-gray-500"
                          }`}
                        >
                          {tier.price}
                        </div>
                      ) : (
                        <div
                          className={`text-sm font-medium ${
                            selectedTier === index
                              ? "text-white/90"
                              : "text-gray-600"
                          }`}
                        >
                          Custom pricing
                        </div>
                      )}
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform ${
                        selectedTier === index
                          ? "rotate-90 text-white"
                          : "text-gray-400 group-hover:text-teal-500"
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Plan Details Card */}
          <div ref={pricingCardRef} className="lg:col-span-3">
            <div
              className={`relative backdrop-blur-sm rounded-3xl p-10 transition-all duration-500 ${
                currentTier.highlighted
                  ? "ring-2 ring-teal-500 shadow-2xl shadow-teal-500/20"
                  : "shadow-xl"
              }`}
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--color-border)',
                borderWidth: currentTier.highlighted ? '0' : '1px'
              }}
            >
              {currentTier.highlighted && (
                <div className="absolute -top-4 left-8">
                  <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                    <Star className="w-4 h-4 fill-current" />
                    Most Popular Choice
                  </div>
                </div>
              )}

              <div className="mb-10">
                <h3 className="text-3xl font-bold mb-4 transition-colors duration-300" style={{ color: 'var(--color-text)' }}>
                  {currentTier.name} Plan
                </h3>
                {currentTier.price ? (
                  <div className="mb-6">
                    <span className="text-5xl font-bold transition-colors duration-300" style={{ color: 'var(--color-text)' }}>
                      {currentTier.price}
                    </span>
                  </div>
                ) : (
                  <div className="text-2xl font-semibold mb-6 transition-colors duration-300" style={{ color: 'var(--color-text-muted)' }}>
                    Contact us for personalized pricing based on your specific
                    requirements
                  </div>
                )}
              </div>

              {currentTier.features && currentTier.features.length > 0 && (
                <div className="mb-10">
                  <h4 className="text-xl font-semibold mb-6 transition-colors duration-300" style={{ color: 'var(--color-text)' }}>
                    What's included:
                  </h4>
                  <ul className="grid sm:grid-cols-2 gap-4">
                    {currentTier.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start group/item"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mr-3 mt-1">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="leading-relaxed transition-colors" style={{ color: 'var(--color-text-muted)' }}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                className={`w-full py-5 px-8 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  currentTier.buttonVariant === "primary"
                    ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30"
                    : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30"
                }`}
                style={currentTier.buttonVariant !== "primary" ? {
                  backgroundColor: 'var(--color-card-bg)',
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '2px'
                } : {}}
              >
                {currentTier.buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
