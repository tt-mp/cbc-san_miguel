import { useState, useRef, useLayoutEffect } from "react";
import { Box, Text } from "@radix-ui/themes";

const BirdPopulationCircle = ({ species, categoryMaxValue, show2022, show2024, animationDelay = 0 }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const prevYearsRef = useRef({ show2022: false, show2024: false });
  const hasInitializedRef = useRef(false);

  // Determine which metric to use early so we can check visibility
  const bothYearsShown = show2022 && show2024;
  const value2022 = bothYearsShown ? species.per_hour_2022 : species.count_2022;
  const value2024 = bothYearsShown ? species.per_hour_2024 : species.count_2024;

  // Initialize animation type based on whether we should pop on mount (category expansion)
  const [animationType, setAnimationType] = useState(() => {
    const now2022Visible = show2022 && value2022 > 0;
    const now2024Visible = show2024 && value2024 > 0;
    // Only pop on mount if there's an animation delay (category expansion)
    if (animationDelay > 0 && (now2022Visible || now2024Visible)) {
      return { animation2022: now2022Visible ? 'pop' : null, animation2024: now2024Visible ? 'pop' : null, delay: animationDelay };
    }
    return null;
  });

  // Detect when years change and determine animation type
  useLayoutEffect(() => {
    const prev = prevYearsRef.current;

    // Determine which circles are actually visible (count > 0 and year toggled on)
    const prev2022Visible = prev.show2022 && value2022 > 0;
    const prev2024Visible = prev.show2024 && value2024 > 0;
    const now2022Visible = show2022 && value2022 > 0;
    const now2024Visible = show2024 && value2024 > 0;

    // Handle initial mount with animation delay (category expansion)
    if (!hasInitializedRef.current && animationDelay > 0 && (now2022Visible || now2024Visible)) {
      const timeout = setTimeout(() => {
        setAnimationType(null);
      }, 500 + (animationType?.delay || animationDelay));
      prevYearsRef.current = { show2022, show2024 };
      hasInitializedRef.current = true;
      return () => clearTimeout(timeout);
    }

    if (!hasInitializedRef.current) {
      prevYearsRef.current = { show2022, show2024 };
      hasInitializedRef.current = true;
      return;
    }

    // Determine what animation to apply to each circle
    const animation2022 =
      !prev2022Visible && now2022Visible ? 'pop' :
      prev2022Visible && !now2022Visible ? 'disappear' :
      prev2022Visible && now2022Visible && (prev2024Visible !== now2024Visible) ? 'pulse' :
      null;

    const animation2024 =
      !prev2024Visible && now2024Visible ? 'pop' :
      prev2024Visible && !now2024Visible ? 'disappear' :
      prev2024Visible && now2024Visible && (prev2022Visible !== now2022Visible) ? 'pulse' :
      null;

    if (animation2022 || animation2024) {
      // Generate random delay ONLY for disappear when square becomes completely empty
      const hasDisappear = animation2022 === 'disappear' || animation2024 === 'disappear';
      const squareBecomesEmpty = !now2022Visible && !now2024Visible;
      const delay = hasDisappear && squareBecomesEmpty ? Math.random() * 600 : 0;

      setAnimationType({ animation2022, animation2024, delay });

      const maxDuration = Math.max(
        animation2022 === 'pop' || animation2022 === 'pulse' ? 500 : 0,
        animation2022 === 'disappear' ? 400 : 0,
        animation2024 === 'pop' || animation2024 === 'pulse' ? 500 : 0,
        animation2024 === 'disappear' ? 400 : 0
      );

      const timeout = setTimeout(() => {
        setAnimationType(null);
      }, maxDuration + delay);

      prevYearsRef.current = { show2022, show2024 };
      return () => clearTimeout(timeout);
    }

    prevYearsRef.current = { show2022, show2024 };
  }, [show2022, show2024, animationDelay, value2022, value2024]);

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

  const scaledRadius2022 = getRadius(value2022);
  const scaledRadius2024 = getRadius(value2024);

  // Calculate percentage change (handle division by zero for new/extinct species)
  const changeValue = species.per_hour_2022 === 0 && species.per_hour_2024 > 0
    ? 'NEW' // Species didn't exist in 2022
    : species.per_hour_2024 === 0 && species.per_hour_2022 > 0
    ? 'GONE' // Species disappeared by 2024
    : ((species.per_hour_2024 - species.per_hour_2022) / species.per_hour_2022) * 100;

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
              className="leading-tight break-words hyphens-auto mb-1 text-center"
              style={{ color: "var(--foreground)", textAlign: "center", width: "100%", display: "block" }}
            >
              {show2022 && !show2024
                ? `${species.count_2022} ${species.name}`
                : !show2022 && show2024
                ? `${species.count_2024} ${species.name}`
                : changeValue === 'NEW'
                ? `+100% ${species.name}`
                : changeValue === 'GONE'
                ? `-100% ${species.name}`
                : `${changeValue > 0 ? '+' : ''}${changeValue.toFixed(0)}% ${species.name}`}
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
                        transition: animationType?.animation2022 ? "r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" : "r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transformOrigin: `${centerPoint}px ${centerPoint}px`,
                        ...(animationType?.animation2022 === 'pop' && {
                          animation: `popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${animationType.delay || 0}ms both`
                        }),
                        ...(animationType?.animation2022 === 'pulse' && {
                          animation: `pulse 0.4s ease-out ${animationType.delay || 0}ms`
                        }),
                        ...(animationType?.animation2022 === 'disappear' && {
                          animation: `disappear 0.4s ease-in ${animationType.delay || 0}ms forwards`
                        })
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
                        transition: animationType?.animation2024 ? "r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" : "r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transformOrigin: `${centerPoint}px ${centerPoint}px`,
                        ...(animationType?.animation2024 === 'pop' && {
                          animation: `popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${animationType.delay || 0}ms both`
                        }),
                        ...(animationType?.animation2024 === 'pulse' && {
                          animation: `pulse 0.4s ease-out ${animationType.delay || 0}ms`
                        }),
                        ...(animationType?.animation2024 === 'disappear' && {
                          animation: `disappear 0.4s ease-in ${animationType.delay || 0}ms forwards`
                        })
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
                        transition: animationType?.animation2024 ? "r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" : "r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transformOrigin: `${centerPoint}px ${centerPoint}px`,
                        ...(animationType?.animation2024 === 'pop' && {
                          animation: `popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${animationType.delay || 0}ms both`
                        }),
                        ...(animationType?.animation2024 === 'pulse' && {
                          animation: `pulse 0.4s ease-out ${animationType.delay || 0}ms`
                        }),
                        ...(animationType?.animation2024 === 'disappear' && {
                          animation: `disappear 0.4s ease-in ${animationType.delay || 0}ms forwards`
                        })
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
                        transition: animationType?.animation2022 ? "r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" : "r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transformOrigin: `${centerPoint}px ${centerPoint}px`,
                        ...(animationType?.animation2022 === 'pop' && {
                          animation: `popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${animationType.delay || 0}ms both`
                        }),
                        ...(animationType?.animation2022 === 'pulse' && {
                          animation: `pulse 0.4s ease-out ${animationType.delay || 0}ms`
                        }),
                        ...(animationType?.animation2022 === 'disappear' && {
                          animation: `disappear 0.4s ease-in ${animationType.delay || 0}ms forwards`
                        })
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
              className="leading-tight break-words hyphens-auto text-center"
              style={{ color: "var(--foreground)", textAlign: "center", width: "100%", display: "block" }}
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
