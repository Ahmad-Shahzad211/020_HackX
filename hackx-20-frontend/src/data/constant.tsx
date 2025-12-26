import {
  AlertCircle,
  ArrowUpLeftSquareIcon,
  BarChart3,
  Bug,
  CreditCard,
  FileText,
  Lightbulb,
  MessageSquare,
  Shield,
  UserIcon,
} from "lucide-react";

// Features
export interface FeatureData {
  id: string;
  title: string;
  description: string;
  icon: any;
}
export const featuresData: FeatureData[] = [
  {
    id: "01",
    title: "Instant Legal Answers",
    description:
      "Ask questions in plain Urdu or English and get accurate legal explanations, case references and actionable advice, just like consulting a lawyer.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-full h-full"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.696-3.696c-.308-.308-.612-.612-.912-.912s-.604-.604-.912-.912H7.5a2.25 2.25 0 01-2.25-2.25V6.75a2.25 2.25 0 012.25-2.25h7.5c.884 0 1.672.483 2.063 1.223z"
        />
      </svg>
    ),
  },
  {
    id: "02",
    title: "Pakistan’s Law Database",
    description:
      "Search the latest Pakistani statutes, Supreme Court rulings and local judgments, updated regularly to keep you ahead in court.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-full h-full"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
  },
  {
    id: "03",
    title: "One Click Legal Drafts",
    description:
      "Generate court ready contracts, petitions and agreements in minutes, customized for Pakistani law with editable templates.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-full h-full"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
    ),
  },
  {
    id: "04",
    title: "Case Strategy Assistant",
    description:
      "Analyze similar past cases, identify winning arguments and prepare stronger legal strategies for your clients.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-full h-full"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
        />
      </svg>
    ),
  },
];

//pricing
export interface PricingTier {
  name: string;
  price?: string;
  features?: string[];
  description?: string;
  highlighted?: boolean;
  buttonText: string;
  buttonVariant?: "primary" | "secondary";
}

export const pricingTiers: PricingTier[] = [
  {
    name: "Quarterly",
    price: "PKR 5,000/-",
    features: ["Chat Requests: 25/day"],
    buttonText: "Choose Plan",
    buttonVariant: "secondary",
  },
  {
    name: "Monthly",
    price: "PKR 2,000/-",
    features: ["Chat Requests: 25/day"],
    buttonText: "Get Started Free",
    highlighted: true,
    buttonVariant: "primary",
  },
  {
    name: "Yearly",
    price: "PKR 18,000/-",
    features: ["Chat Requests: 25/day"],
    buttonText: "Choose Plan",
    buttonVariant: "secondary",
  },
  {
    name: "Custom",
    description: "Contact our team for Custom Pricing",
    buttonText: "Choose Plan",
    buttonVariant: "primary",
  },
];

// FAQs
export interface FAQ {
  question: string;
  answer: string;
}

export const faqsData: FAQ[] = [
  {
    question: "What is Chat Legis?",
    answer:
      "Chat Legis is an AI-powered legal assistant that helps you create legal drafts, reference laws and judgments, and get quick legal insights all in one place.",
  },
  {
    question: "Is my data safe on Chat Legis?",
    answer:
      "Yes, your data is completely secure with Chat Legis. We employ end-to-end encryption and adhere to strict data protection regulations. Your information is never shared with third parties, and we maintain rigorous security protocols to ensure client confidentiality.",
  },
  {
    question: "What do I get in the Free Plan?",
    answer:
      "The Free Plan includes access to basic legal research capabilities, limited document generation (up to 5 per month), access to common legal templates, and basic chat assistance. Upgrade to premium plans for unlimited documents, advanced research tools, and priority support.",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can contact our support team via email at legischat@gmail.com, or through the in-app feedback feature. We aim to respond to all inquiries within 24 hours on business days.",
  },
];

//chatscreen Cards
export const cards = [
  {
    icon: "📄",
    title: "Document Analysis",
    description:
      "Review and analyze legal documents, contracts, and agreements",
  },
  {
    icon: "⚖️",
    title: "Case Research",
    description: "Find relevant cases and legal precedents for your research",
  },
  {
    icon: "✍️",
    title: "Legal Writing",
    description: "Draft legal documents, briefs, and memorandums",
  },
  {
    icon: "🔍",
    title: "Legal Research",
    description: "Research statutes, regulations and legal frameworks",
  },
];

export const sectionFadeInFromBottom = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
};

export const cardGridContainerVariants = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export const cardItemVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

// Animation variants (unchanged from your original)
export const sidebarVariants = {
  open: { width: "300px", opacity: 1 },
  closed: { width: "0px", opacity: 0 },
};

export const usageCards = [
  {
    title: "Drafts Created",
    current: 8,
    limit: 10,
    percentage: 80,
    icon: FileText,
    color: "from-red-500 to-red-600",
  },
  {
    title: "Case Summaries",
    current: 8,
    limit: 100,
    percentage: 8,
    icon: BarChart3,
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "Chatbot Queries",
    current: 8,
    limit: 100,
    percentage: 8,
    icon: MessageSquare,
    color: "from-green-500 to-green-600",
  },
];
export const navigationItems = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Features",
    href: "/#features",
  },
  {
    title: "Pricing",
    href: "/#pricing",
  },
  // {
  //   title: "Contact",
  //   href: "/contact",
  // },
];
export const tools = [
  {
    title: "Judgment Search",
    href: "judgment",
    icon: "⚖️",
  },
  {
    title: "Statutes",
    href: "statutes",
    icon: "📜",
  },
  {
    title: "Suites",
    href: "suites",
    icon: "✍️",
  },
  {
    title: "Contract View",
    href: "contract",
    icon: "📄",
  },
  {
    title: "Drafts",
    href: "drafts",
    icon: "✍️",
  },

  {
    title: "Synopsis",
    href: "synopsis",
    icon: "📄",
  },
];

export const feedbackTypes = [
  {
    value: "feedback",
    label: "General Feedback",
    icon: MessageSquare,
    color: "from-blue-500 to-blue-600",
  },
  {
    value: "issue",
    label: "Report Issue",
    icon: AlertCircle,
    color: "from-orange-500 to-orange-600",
  },
  {
    value: "bug",
    label: "Bug Report",
    icon: Bug,
    color: "from-red-500 to-red-600",
  },
  {
    value: "suggestion",
    label: "Feature Suggestion",
    icon: Lightbulb,
    color: "from-green-500 to-green-600",
  },
];
