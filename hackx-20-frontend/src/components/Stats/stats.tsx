import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const statsData = [
  { id: 1, label: "Registered Users", endValue: 50000 },
  { id: 2, label: "No. of Lawyers using Chat Legis", endValue: 50000 },
  { id: 3, label: "No. of Judges using Chat Legis", endValue: 50000 },
  { id: 4, label: "No. of Lay man using Chat Legis", endValue: 50000 },
];

const Stats = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const statsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numberRefs = useRef<(HTMLDivElement | null)[]>([]); // NEW: to store number divs

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate heading and subtitle
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        }
      );

      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        }
      );

      // Animate stat cards + numbers
      statsRefs.current.forEach((stat, index) => {
        const numEl = numberRefs.current[index];
        const endVal = statsData[index].endValue;

        gsap.fromTo(
          stat,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.3 + index * 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              once: true,
              onEnter: () => {
                if (!numEl) return;
                const obj = { val: 0 };
                gsap.to(obj, {
                  val: endVal,
                  duration: 2,
                  ease: "power2.out",
                  onUpdate: () => {
                    numEl.innerText =
                      obj.val >= 1000
                        ? `${Math.floor(obj.val / 1000)}k+`
                        : `${Math.floor(obj.val).toString()}+`;
                  },
                });
              },
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);
  return (
    <div
      ref={sectionRef}
      className="py-16 md:py-24 px-4 md:px-8"
      style={{ background: "transparent" }}
    >
      <div className="max-w-7xl mx-auto text-center">
        <h2
          ref={headingRef}
          className="text-4xl md:text-5xl font-bold mb-3 transition-colors duration-300"
          style={{ color: 'var(--color-primary)' }}
        >
          Our satisfied customers
        </h2>
        <p ref={subtitleRef} className="text-lg mb-10 transition-colors duration-300" style={{ color: 'var(--color-text-muted)' }}>
          Flexible pricing tailored to your legal needs, whether you're just
          starting out or scaling up
        </p>

        <div className="rounded-2xl p-8 md:p-12 shadow-sm transition-colors duration-300" style={{  borderColor: 'var(--color-border)', borderWidth: '1px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, index) => (
              <div
                key={stat.id}
                ref={(el) => {
                  statsRefs.current[index] = el;
                }}
                className="rounded-2xl p-8 py-10 flex flex-col items-center justify-center aspect-square transition-colors duration-300"
                style={{ 
                  // backgroundColor: 'var(--color-card-bg)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '2px'
                }}
              >
                <div className="text-sm font-medium py-2.5 px-5 rounded-full mb-6 whitespace-nowrap transition-colors duration-300" style={{ 
                  backgroundColor: 'rgba(20, 184, 166, 0.1)',
                  color: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  borderWidth: '1px'
                }}>
                  {stat.label}
                </div>
                <div
                  className="text-5xl md:text-6xl font-bold transition-colors duration-300"
                  style={{ color: 'var(--color-primary)' }}
                  ref={(el) => {
                    numberRefs.current[index] = el;
                  }}
                >
                  {stat.endValue}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
