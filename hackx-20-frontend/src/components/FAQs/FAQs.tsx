import React, { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./FAQ.css";
import { faqsData } from "@/data/constant"; // Adjust path if necessary

gsap.registerPlugin(ScrollTrigger);

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  index: number;
}

const FAQItem: React.FC<FAQItemProps> = ({
  question,
  answer,
  isOpen,
  onClick,
  index,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (answerRef.current) {
      if (isOpen) {
        // Expand answer
        gsap.fromTo(
          answerRef.current,
          {
            height: 0,
            opacity: 0,
            paddingTop: 0,
            paddingBottom: 0,
          },
          {
            height: "auto",
            opacity: 1,
            paddingTop: 16,
            paddingBottom: 16,
            duration: 0.3,
            ease: "power2.out",
          }
        );
      } else {
        // Collapse answer
        gsap.to(answerRef.current, {
          height: 0,
          opacity: 0,
          paddingTop: 0,
          paddingBottom: 0,
          duration: 0.2,
          ease: "power2.in",
        });
      }
    }
  }, [isOpen]);

  return (
    <div ref={itemRef} className="faqItem-container">
      <div
        className={`faqItem ${
          isOpen ? "active text-white" : ""
        }`}
        onClick={onClick}
        style={isOpen ? { background: 'var(--gradient-primary)' } : { backgroundColor: 'var(--color-card-bg)', color: 'var(--color-text)' }}
      >
        <div className="questionRow">
          <h3 className="question">{question}</h3>
          <span className="toggleIcon">{isOpen ? "−" : "+"}</span>
        </div>
      </div>
      <div
        ref={answerRef}
        className="faqAnswer"
        style={{
          height: 0,
          overflow: "hidden",
          opacity: 0,
          padding: "0 20px",
        }}
      >
        <p>{answer}</p>
      </div>
    </div>
  );
};

const FAQs: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number>(-1);
  const faqsContainerRef = useRef<HTMLDivElement>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  useEffect(() => {
    if (faqsContainerRef.current) {
      const faqItems =
        faqsContainerRef.current.querySelectorAll(".faqItem-container");
      if (faqItems.length > 0) {
        gsap.fromTo(
          faqItems,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.2,
            scrollTrigger: {
              trigger: faqsContainerRef.current,
              start: "top 85%",
              end: "bottom center",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section className="faqsSection">
      <h2 className="faqsTitle">Frequently Asked Questions</h2>
      <p className="faqsSubtitle">Contact us anytime.</p>

      <div ref={faqsContainerRef} className="faqsList">
        {faqsData.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onClick={() => toggleFAQ(index)}
            index={index}
          />
        ))}
      </div>
    </section>
  );
};

export default FAQs;
