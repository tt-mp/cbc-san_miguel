"use client";

import { useState } from "react";
import { Flex, Text, Box } from "@radix-ui/themes";
import BirdCategory from "./BirdCategory";

export default function Landing() {
  const [show2022, setShow2022] = useState(true);
  const [show2024, setShow2024] = useState(true);

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
        <Text size="3" weight="bold">Birds of San Miguel de Allende</Text>

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