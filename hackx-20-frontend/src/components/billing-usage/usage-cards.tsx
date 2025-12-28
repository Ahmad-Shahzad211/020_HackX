interface UsageCardProps {
  card: {
    title: string;
    current: number | string;
    limit: number | string;
    percentage: number;
    icon: React.ElementType;
    color: string;
  };
}

const UsageCard = ({ card }: UsageCardProps) => {
  const Icon = card.icon;

  const sharedClasses =
    "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl group rounded-xl sm:rounded-xl lg:rounded-2xl p-4 sm:p-4 lg:p-6";

  const getGradient = () => {
    if (card.title.includes("Draft")) return "from-red-500 to-red-600";
    if (card.title.includes("Case")) return "from-blue-500 to-blue-600";
    if (card.title.includes("Chatbot")) return "from-green-500 to-green-600";
    return "from-gray-400 to-gray-600"; // fallback
  };

  const iconWrapperClasses = `bg-gradient-to-r ${getGradient()} shadow-lg group-hover:scale-110 transition-transform duration-300`;
  const bar = (
    <div className="w-full bg-white/20 rounded-full h-[6px] overflow-hidden mb-1">
      <div
        className={`h-full bg-gradient-to-r ${getGradient()} rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${card.percentage}%` }}
      />
    </div>
  );

  return (
    <div className={sharedClasses}>
      <div className="flex flex-col sm:flex-col lg:flex-col items-start sm:items-center lg:items-stretch text-left sm:text-center lg:text-left">
        {/* Icon + Values */}
        <div className="flex justify-between items-center w-full mb-3 sm:mb-3 lg:mb-4">
          <div
            className={`p-2 sm:p-3 lg:p-3 rounded-lg sm:rounded-xl lg:rounded-xl ${iconWrapperClasses}`}
          >
            <Icon className="text-white w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="text-right sm:text-center lg:text-right">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              {card.current}
            </div>
            <div className="text-white/70 text-xs sm:text-xs lg:text-sm">
              of {card.limit}
            </div>
          </div>
        </div>

        {/* Title + Bar */}
        <div className="w-full mb-2 sm:mb-2 lg:mb-3">
          <h3 className="font-semibold text-white text-sm sm:text-sm lg:text-lg mb-1 sm:mb-2">
            {card.title}
          </h3>
          {bar}
        </div>

        {/* Footer Info */}
        <div className="flex justify-between sm:justify-center lg:justify-between items-center w-full">
          <span className="text-white/80 text-xs sm:text-xs lg:text-sm">
            {card.percentage}% used
          </span>
          <span className="text-white/60 text-xs hidden sm:inline lg:inline">
            this month
          </span>
        </div>
      </div>
    </div>
  );
};

export default UsageCard;
