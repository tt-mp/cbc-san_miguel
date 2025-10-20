import { useState } from "react";
import { Box, Text } from "@radix-ui/themes";

const BirdPopulationCircle = ({ species, categoryMaxValue, show2022, show2024 }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const viewBoxSize = 100;
  const centerPoint = viewBoxSize / 2;

  // Use consistent scale based on category maximum
  // Circle area should be proportional to value, so radius = sqrt(value)
  const getRadius = (value) => {
    if (value === 0) return 0;
    // Scale based on category max to fill about 80% of viewBox at maximum
    const maxPossibleRadius = viewBoxSize * 0.4;
    return Math.sqrt(value / categoryMaxValue) * maxPossibleRadius;
  };

  const scaledRadius2022 = getRadius(species.per_hour_2022);
  const scaledRadius2024 = getRadius(species.per_hour_2024);

  const changeValue = species.change;
  const changeDisplay =
    changeValue > 0 ? `+${changeValue.toFixed(2)}` : changeValue.toFixed(2);

  const handleMouseMove = (e) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = () => {
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  return (
    <>
      {tooltipVisible && show2022 && show2024 && (
        <div
          className="fixed z-[9999] min-w-[200px] p-2.5 pointer-events-none shadow-lg"
          style={{
            left: tooltipPosition.x + 15,
            top: tooltipPosition.y + 15,
            backgroundColor: "var(--background)",
          }}
        >
          <div className="font-bold text-xs mb-2" style={{ color: "var(--foreground)" }}>
            {species.name}
          </div>
          <div className="flex flex-col gap-1">
            {show2022 && (
              <div className="flex justify-between items-baseline gap-3">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "var(--circle-outer)" }}
                  />
                  <span className="text-xs" style={{ color: "var(--foreground)" }}>
                    2022
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-xs" style={{ color: "var(--foreground)" }}>
                    {species.count_2022}
                  </span>
                  <span className="text-[10px] opacity-60" style={{ color: "var(--foreground)" }}>
                    ({species.per_hour_2022.toFixed(2)}/hr)
                  </span>
                </div>
              </div>
            )}
            {show2024 && (
              <div className="flex justify-between items-baseline gap-3">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "var(--circle-inner)" }}
                  />
                  <span className="text-xs" style={{ color: "var(--foreground)" }}>
                    2024
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-xs" style={{ color: "var(--foreground)" }}>
                    {species.count_2024}
                  </span>
                  <span className="text-[10px] opacity-60" style={{ color: "var(--foreground)" }}>
                    ({species.per_hour_2024.toFixed(2)}/hr)
                  </span>
                </div>
              </div>
            )}
            {show2022 && show2024 && (
              <div
                className="flex justify-between items-center mt-1.5 pt-1.5 border-t"
                style={{ borderColor: "var(--foreground)" }}
              >
                <span className="text-xs" style={{ color: "var(--foreground)" }}>
                  Change
                </span>
                <span
                  className="font-bold text-xs"
                  style={{
                    color:
                      changeValue > 0
                        ? "#4CAF50"
                        : changeValue < 0
                        ? "#E84A5F"
                        : "var(--foreground)",
                  }}
                >
                  {changeDisplay}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      <Box className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
        {/* Show circles when at least one year is toggled */}
        {show2022 || show2024 ? (
          <>
            {/* Bird name at top */}
            <Text
              size="1"
              align="center"
              className="leading-tight break-words hyphens-auto mb-1"
              style={{ color: "var(--foreground)" }}
            >
              {show2022 && !show2024
                ? `${species.count_2022} ${species.name}`
                : !show2022 && show2024
                ? `${species.count_2024} ${species.name}`
                : species.name}
            </Text>

            <Box
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="w-[70%] aspect-square mx-auto"
              style={{ overflow: "hidden" }}
            >
              <svg
                viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                className="w-full h-full block"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Always render both circles, use opacity and scale to show/hide */}
                {scaledRadius2022 >= scaledRadius2024 ? (
                  <>
                    {/* 2022 circle (larger, rendered first) */}
                    <circle
                      cx={centerPoint}
                      cy={centerPoint}
                      r={scaledRadius2022 || 0.1}
                      fill="var(--circle-outer)"
                      opacity={show2022 ? 1 : 0}
                      transform={`scale(${show2022 ? 1 : 0})`}
                      style={{
                        transition: "r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transformOrigin: `${centerPoint}px ${centerPoint}px`
                      }}
                    />
                    {/* 2024 circle (smaller, rendered on top) */}
                    <circle
                      cx={centerPoint}
                      cy={centerPoint}
                      r={scaledRadius2024 || 0.1}
                      fill="var(--circle-inner)"
                      opacity={show2024 ? 1 : 0}
                      transform={`scale(${show2024 ? 1 : 0})`}
                      style={{
                        transition: "r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transformOrigin: `${centerPoint}px ${centerPoint}px`
                      }}
                    />
                  </>
                ) : (
                  <>
                    {/* 2024 circle (larger, rendered first) */}
                    <circle
                      cx={centerPoint}
                      cy={centerPoint}
                      r={scaledRadius2024 || 0.1}
                      fill="var(--circle-inner)"
                      opacity={show2024 ? 1 : 0}
                      transform={`scale(${show2024 ? 1 : 0})`}
                      style={{
                        transition: "r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transformOrigin: `${centerPoint}px ${centerPoint}px`
                      }}
                    />
                    {/* 2022 circle (smaller, rendered on top) */}
                    <circle
                      cx={centerPoint}
                      cy={centerPoint}
                      r={scaledRadius2022 || 0.1}
                      fill="var(--circle-outer)"
                      opacity={show2022 ? 1 : 0}
                      transform={`scale(${show2022 ? 1 : 0})`}
                      style={{
                        transition: "r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transformOrigin: `${centerPoint}px ${centerPoint}px`
                      }}
                    />
                  </>
                )}
              </svg>
            </Box>
          </>
        ) : (
          /* Neither year - just show name */
          <Box
            className="w-full h-full flex items-center justify-center"
          >
            <Text
              size="1"
              align="center"
              className="leading-tight break-words hyphens-auto"
              style={{ color: "var(--foreground)" }}
            >
              {species.name}
            </Text>
          </Box>
        )}
      </Box>
    </>
  );
};

export default BirdPopulationCircle;
