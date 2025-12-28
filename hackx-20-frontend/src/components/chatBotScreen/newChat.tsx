import { motion } from "framer-motion";
import { sectionFadeInFromBottom } from "@/data/constant";
import { useEffect, useState } from "react";

const NewChat = () => {
  const [typedTitle, setTypedTitle] = useState("");

  const fullTitle = "Chat Legis";
  const typingSpeed = 150;

  // Typing animation for title
  useEffect(() => {
    if (typedTitle.length < fullTitle.length) {
      const timeoutId = setTimeout(() => {
        setTypedTitle(fullTitle.substring(0, typedTitle.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timeoutId);
    }
  }, [typedTitle]);

  return (
    <>
      <motion.div
        className="text-center mb-8 md:mb-12 grid items-center -mt-40"
        style={{
          background: 'var(--color-bg)',
          borderRadius: '1rem',
          padding: '2rem 0',
          transition: 'background 0.3s',
        }}
        variants={sectionFadeInFromBottom}
        initial="initial"
        animate="animate"
      >
        <h1
          className="text-4xl sm:text-5xl font-bold min-h-[1.2em]"
          style={{
            background: 'linear-gradient(90deg, #228E98 0%, #6EE7B7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            transition: 'background 0.3s',
          }}
        >
          {typedTitle}
          {typedTitle.length === fullTitle.length ? (
            ""
          ) : (
            <span className="animate-ping ml-1">|</span>
          )}
        </h1>
        <p
          className="text-lg sm:text-xl mt-3 sm:mt-4 px-4 max-w-3xl mx-auto"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Get instant answers and insights from our AI-powered legal expert.
        </p>
      </motion.div>
    </>
  );
};

export default NewChat;
