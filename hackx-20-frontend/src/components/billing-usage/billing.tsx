import { TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const LineChart = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 500 });
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    value: number;
    label: string;
    color: string;
    month: string;
  } | null>(null);

  // Data and labels remain the same...
  const data = [
    [10, 100, 300, 1000, 500, 200, 100, 300, 500, 700, 500, 300],
    [200, 300, 400, 500, 300, 200, 300, 400, 600, 500, 400, 300],
    [400, 300, 200, 300, 400, 300, 300, 300, 400, 600, 500, 200],
  ];
  const colors = ["#ffffff", "#1f2937", "#ef4444"];
  const labels = ["Case Summaries", "Chatbot Queries", "Drafts Created"];
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  // Responsive dimensions with better overflow handling
  const getResponsiveDimensions = (containerWidth: number) => {
    return {
      width: Math.max(700, Math.min(containerWidth - 80, 1000)),
      height: 500,
    };
  };

  const padding =
    dimensions.width < 640 ? 40 : dimensions.width < 1024 ? 60 : 80;
  const maxY = 1000;
  const minY = 10;

  // Update dimensions on resize with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newDimensions = getResponsiveDimensions(containerWidth);
        setDimensions(newDimensions);
      }
    };

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, 150);
    };

    updateDimensions();
    window.addEventListener("resize", debouncedUpdate);
    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, []);

  // Rest of the component logic remains the same...
  const getPoints = (arr: number[]) =>
    arr.map((y, i) => {
      const x =
        padding + (i * (dimensions.width - 2 * padding)) / (arr.length - 1);
      const yLog = Math.log10(y) - Math.log10(minY);
      const yMaxLog = Math.log10(maxY) - Math.log10(minY);
      const yPos =
        dimensions.height -
        padding -
        (yLog / yMaxLog) * (dimensions.height - 2 * padding);
      return { x, y: yPos, value: y, month: months[i] };
    });

  const allPoints = data.map(getPoints);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 sm:p-6 border border-white/10">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-black mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#A0D2DB]" />
            <span className="hidden sm:inline">Usage Analytics</span>
            <span className="sm:hidden">Analytics</span>
          </h3>
          <p className="text-black text-xs sm:text-sm ml-6 sm:ml-7 hidden sm:block">
            Track your monthly usage across all services
          </p>
        </div>

        {/* Fixed overflow container for chart */}
        <div className="relative w-full">
          <div
            className="w-full"
            style={{ minHeight: `${dimensions.height}px` }}
          >
            <svg
              width={dimensions.width}
              height={dimensions.height}
              style={{
                display: "block",
                background: "transparent",
                maxWidth: "100%",
                height: "auto",
              }}
              className="drop-shadow-lg mx-auto"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* All SVG content remains the same but with fixed positioning */}
              {/* Grid lines */}
              {[10, 100, 500, 1000].map((y) => {
                const yLog = Math.log10(y) - Math.log10(minY);
                const yMaxLog = Math.log10(maxY) - Math.log10(minY);
                const yPos =
                  dimensions.height -
                  padding -
                  (yLog / yMaxLog) * (dimensions.height - 2 * padding);
                return (
                  <line
                    key={`grid-${y}`}
                    x1={padding}
                    y1={yPos}
                    x2={dimensions.width - padding}
                    y2={yPos}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={1}
                    strokeDasharray="4,4"
                  />
                );
              })}

              {/* Axes */}
              <line
                x1={padding}
                y1={padding}
                x2={padding}
                y2={dimensions.height - padding}
                stroke="rgba(160,210,219,0.8)"
                strokeWidth={2}
              />
              <line
                x1={padding}
                y1={dimensions.height - padding}
                x2={dimensions.width - padding}
                y2={dimensions.height - padding}
                stroke="rgba(160,210,219,0.8)"
                strokeWidth={2}
              />

              {/* Y axis labels */}
              {[10, 100, 500, 1000].map((y) => {
                const yLog = Math.log10(y) - Math.log10(minY);
                const yMaxLog = Math.log10(maxY) - Math.log10(minY);
                const yPos =
                  dimensions.height -
                  padding -
                  (yLog / yMaxLog) * (dimensions.height - 2 * padding);
                return (
                  <g key={y}>
                    <line
                      x1={padding - 8}
                      y1={yPos}
                      x2={padding}
                      y2={yPos}
                      stroke="rgba(160,210,219,0.8)"
                      strokeWidth={2}
                    />
                    <text
                      x={padding - 15}
                      y={yPos + 5}
                      fontSize={dimensions.width < 640 ? "10" : "12"}
                      fill="rgba(255,255,255,0.8)"
                      textAnchor="end"
                      fontFamily="system-ui"
                      fontWeight="500"
                    >
                      {y}
                    </text>
                  </g>
                );
              })}

              {/* X axis labels */}
              {months.map((m, i) => {
                const x =
                  padding +
                  (i * (dimensions.width - 2 * padding)) / (months.length - 1);
                return (
                  <text
                    key={m}
                    x={x}
                    y={dimensions.height - padding + 20}
                    fontSize={dimensions.width < 640 ? "9" : "11"}
                    fill="rgba(255,255,255,0.7)"
                    textAnchor="middle"
                    fontFamily="system-ui"
                    fontWeight="500"
                  >
                    {dimensions.width < 640 ? m.slice(0, 1) : m}
                  </text>
                );
              })}

              {/* Chart content */}
              <defs>
                {colors.map((color, i) => (
                  <linearGradient
                    key={i}
                    id={`gradient-${i}`}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.1" />
                  </linearGradient>
                ))}
              </defs>

              {allPoints.map((points, i) => (
                <g key={i}>
                  <path
                    d={`M ${points[0].x} ${
                      dimensions.height - padding
                    } L ${points.map((p) => `${p.x} ${p.y}`).join(" L ")} L ${
                      points[points.length - 1].x
                    } ${dimensions.height - padding} Z`}
                    fill={`url(#gradient-${i})`}
                  />
                  <polyline
                    fill="none"
                    stroke={colors[i]}
                    strokeWidth={dimensions.width < 640 ? 2 : 3}
                    points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                  />
                </g>
              ))}

              {/* Interactive points */}
              {allPoints.map((points, lineIdx) =>
                points.map((pt, ptIdx) => (
                  <g key={`${lineIdx}-${ptIdx}`}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={dimensions.width < 640 ? 8 : 12}
                      fill="transparent"
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() =>
                        setTooltip({
                          x: pt.x,
                          y: pt.y,
                          value: pt.value,
                          label: labels[lineIdx],
                          color: colors[lineIdx],
                          month: pt.month,
                        })
                      }
                      onMouseLeave={() => setTooltip(null)}
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={dimensions.width < 640 ? 3 : 5}
                      fill={colors[lineIdx]}
                      stroke="white"
                      strokeWidth={2}
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                        transition: "all 0.2s ease",
                      }}
                      className="hover:scale-125"
                    />
                  </g>
                ))
              )}
            </svg>
          </div>

          {/* Enhanced Tooltip with better positioning */}
          {tooltip && (
            <div
              className="absolute bg-white/95 backdrop-blur-sm text-gray-800 rounded-xl shadow-2xl border border-white/20 transition-all duration-200 ease-out z-50"
              style={{
                left: Math.min(
                  Math.max(10, tooltip.x + 15),
                  dimensions.width - 160
                ),
                top: Math.max(10, tooltip.y - 15),
                padding: "8px 12px",
                fontSize: dimensions.width < 640 ? 11 : 13,
                pointerEvents: "none",
                minWidth: dimensions.width < 640 ? 120 : 140,
                transform: "translateY(-50%)",
              }}
            >
              <div
                className="font-semibold mb-1"
                style={{ color: tooltip.color }}
              >
                {tooltip.label}
              </div>
              <div className="text-gray-600 text-xs mb-1">
                {tooltip.month} 2024
              </div>
              <div
                className="font-bold text-base sm:text-lg"
                style={{ color: tooltip.color }}
              >
                {tooltip.value.toLocaleString()}
              </div>
              <div
                className="absolute w-2 h-2 rotate-45 -left-1 top-1/2 transform -translate-y-1/2"
                style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
              />
            </div>
          )}
        </div>

        {/* Enhanced Legend */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-8 mt-4 sm:mt-8">
          {labels.map((label, i) => (
            <div
              key={label}
              className="flex items-center gap-2 sm:gap-3 group cursor-pointer"
            >
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-200"
                style={{ backgroundColor: colors[i] }}
              />
              <span className="text-white/90 text-xs sm:text-sm font-medium group-hover:text-white transition-colors duration-200">
                {dimensions.width < 640 ? label.split(" ")[0] : label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default LineChart;
