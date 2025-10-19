"use client";

import { useState, useEffect } from "react";
import { Flex, Text, Box } from "@radix-ui/themes";
import { SunIcon } from "@radix-ui/react-icons";
import BirdCategory from "./BirdCategory";

// Simple filled circle to match the sun's center (without rays)
const MoonIcon = ({ width = 16, height = 16 }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="7.5"
      cy="7.5"
      r="3.5"
      fill="currentColor"
    />
  </svg>
);

export default function Landing() {
  const [show2022, setShow2022] = useState(true);
  const [show2024, setShow2024] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // Initialize based on system preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
  }, []);

  // Apply dark/light mode class when toggled (overrides system preference)
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <Flex direction="column" gap="4" mt="4" px="6">
      <Flex
        justify="between"
        align="center"
        mb="4"
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "var(--background)",
          zIndex: 100,
          paddingTop: "1rem",
          paddingBottom: "1rem",
          marginLeft: "-1.5rem",
          marginRight: "-1.5rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem"
        }}
      >
        <Flex gap="3" align="center">
          <Text size="3" weight="bold">Birds of San Miguel de Allende</Text>

          {/* Dark mode toggle */}
          <Box
            onClick={() => setIsDark(!isDark)}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              opacity: 0.6,
              transition: "opacity 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.6"}
          >
            {isDark ? <MoonIcon width="16" height="16" /> : <SunIcon width="16" height="16" />}
          </Box>
        </Flex>

        {/* Legend */}
        <Flex gap="4" align="center">
          <Text size="2" weight="medium" style={{ marginRight: "0.5rem" }}>
            Viewing
          </Text>
          <Flex
            gap="2"
            align="center"
            onClick={() => setShow2022(!show2022)}
            style={{
              cursor: "pointer",
              opacity: show2022 ? 1 : 0.4,
              transition: "opacity 0.2s ease"
            }}
          >
            <Box
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "var(--circle-outer)",
                flexShrink: 0
              }}
            />
            <Text size="2" weight="medium">2022</Text>
          </Flex>

          <Flex
            gap="2"
            align="center"
            onClick={() => setShow2024(!show2024)}
            style={{
              cursor: "pointer",
              opacity: show2024 ? 1 : 0.4,
              transition: "opacity 0.2s ease"
            }}
          >
            <Box
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "var(--circle-inner)",
                flexShrink: 0
              }}
            />
            <Text size="2" weight="medium">2024</Text>
          </Flex>
        </Flex>
      </Flex>

      <BirdCategory show2022={show2022} show2024={show2024} />
    </Flex>
  );
}