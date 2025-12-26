import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Custom Avatar component that displays initials
const Avatar = ({
  name,
  color = "#228E98",
}: {
  name: string;
  color?: string;
}) => {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div
      className="w-full h-full flex items-center justify-center text-white font-semibold text-xl"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
};

// Dummy testimonial data with initial-based avatars
const testimonialData = [
  {
    id: 1,
    name: "James Pattinson",
    rating: 4,
    text: "Chat-Legis transformed how I handle legal research. The AI assistant helped me draft complex motions in half the time while maintaining accuracy and compliance.",
  },
  {
    id: 2,
    name: "Greg Stuart",
    rating: 5,
    text: "As a corporate lawyer, I've found Chat-Legis to be invaluable for contract review and drafting. It's helped me identify issues I might have otherwise missed.",
  },
  {
    id: 3,
    name: "Trevor Mitchell",
    rating: 3,
    text: "Chat-Legis helped me navigate complex legal terminology as a non-lawyer. It simplified the process of understanding my rights in a property dispute.",
  },
  {
    id: 4,
    name: "Sarah Johnson",
    rating: 5,
    text: "The document analysis feature saved me countless hours. Chat-Legis quickly summarized a 50-page contract and highlighted the key terms I needed to focus on.",
  },
  {
    id: 5,
    name: "Michael Chen",
    rating: 4,
    text: "As a small business owner, Chat-Legis has been my go-to legal assistant. It helps me draft agreements and understand regulatory requirements without expensive consultations.",
  },
  {
    id: 6,
    name: "Elena Rodriguez",
    rating: 5,
    text: "The legal research capabilities of Chat-Legis are exceptional. It helped me find relevant case law and statutes for my academic research in record time.",
  },
];

const PRIMARY_COLOR = "#228E98";

export default function Testimonials() {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const testimonialsPerPage = 3;
  const pageCount = Math.ceil(testimonialData.length / testimonialsPerPage);

  // Get current testimonials based on page
  const displayedTestimonials = testimonialData.slice(
    currentPage * testimonialsPerPage,
    (currentPage + 1) * testimonialsPerPage
  );

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentPage((prev) => (prev === 0 ? pageCount - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentPage((prev) => (prev === pageCount - 1 ? 0 : prev + 1));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const cardVariants = {
    hidden: (direction: number) => ({
      x: direction * 50,
      opacity: 0,
      scale: 0.95,
    }),
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
    exit: (direction: number) => ({
      x: direction * -50,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    }),
  };

  // Generate star rating display
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 xs:w-5 xs:h-5 ${
            i < rating ? "text-yellow-400" : "text-gray-300"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
            clipRule="evenodd"
          />
        </svg>
      ));
  };

  return (
    <div
      className="py-12 xs:py-16 sm:py-20 md:py-24 lg:py-28 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 relative z-20 overflow-hidden"
      id="testimonials"
    >
      <div className="max-w-7xl mx-auto mb-8 xs:mb-10 sm:mb-12 md:mb-16 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-3 xs:mb-4 sm:mb-5 transition-colors duration-300"
          style={{ color: 'var(--color-primary)' }}
        >
          Our Satisfied Customers
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl xs:text-base sm:text-lg md:text-xl transition-colors duration-300"
          style={{ color: 'var(--color-text-muted)' }}
        >
          What our clients say about us
        </motion.p>
      </div>

      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={currentPage}
          className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          custom={direction}
        >
          {displayedTestimonials.map((testimonial, index) => (
            <motion.div
              key={`${currentPage}-${testimonial.id}`}
              custom={direction}
              variants={cardVariants}
              className="p-4 xs:p-5 sm:p-6 md:p-8 rounded-lg xs:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--color-border)', borderWidth: '1px' }}
              whileHover={{
                y: -8,
                boxShadow: "0px 15px 25px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.3 },
              }}
            >
              <motion.div
                className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-4 border-2 border-teal-200 relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              > 
                <Avatar name={testimonial.name} color={PRIMARY_COLOR} />
              </motion.div>
              <h3 className="text-base xs:text-lg sm:text-xl font-semibold mb-2 transition-colors duration-300" style={{ color: 'var(--color-text)' }}>
                {testimonial.name}
              </h3>
              <div className="flex mb-3 justify-center">
                {renderStars(testimonial.rating)}
              </div>
              <p className="text-xs xs:text-sm sm:text-base flex-grow transition-colors duration-300" style={{ color: 'var(--color-text-muted)' }}>
                {testimonial.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col gap-4 items-center">
        <div className="flex justify-center gap-3">
          <motion.button
            onClick={handlePrevious}
            className="w-10 h-10 xs:w-12 xs:h-12 bg-gradient-primary text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
            aria-label="Previous testimonials"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>
          <motion.button
            onClick={handleNext}
            className="w-10 h-10 xs:w-12 xs:h-12 bg-gradient-primary text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
            aria-label="Next testimonials"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        </div>

        {/* Page indicators */}
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: pageCount }).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setDirection(index > currentPage ? 1 : -1);
                setCurrentPage(index);
              }}
              className="h-2 rounded-full bg-teal-300 focus:outline-none"
              style={{
                width: index === currentPage ? "24px" : "8px",
              }}
              animate={{
                opacity: index === currentPage ? 1 : 0.5,
                width: index === currentPage ? "24px" : "8px",
                backgroundColor:
                  index === currentPage
                    ? PRIMARY_COLOR
                    : "rgb(94, 234, 212, 0.5)",
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
