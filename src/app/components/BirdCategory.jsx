"use client";

import { useState, useEffect } from "react";
import { Box, Grid, Text, IconButton } from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import data from "../../data/cbc_2022-2024.json";
import BirdPopulationCircle from "./BirdPopulationCircle";

export default function BirdCategory({ show2022, show2024, expandAll, setExpandAll }) {
  // Sort species by absolute change (largest changes first)
  const categoriesWithSortedSpecies = data.categories.map(category => ({
    ...category,
    species: [...category.species].sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
  }));

  // Calculate category change and sort categories by absolute change
  const categories = categoriesWithSortedSpecies
    .map(category => {
      const total2022 = category.species.reduce((sum, bird) => sum + bird.per_hour_2022, 0);
      const total2024 = category.species.reduce((sum, bird) => sum + bird.per_hour_2024, 0);
      const categoryChange = total2022 > 0 ? ((total2024 - total2022) / total2022) * 100 : 0;
      return {
        ...category,
        categoryChange
      };
    })
    .sort((a, b) => Math.abs(b.categoryChange) - Math.abs(a.categoryChange));

  // Hardcoded random column positions (1-5) with no adjacent duplicates
  const columnPositions = [2, 4, 1, 5, 3, 1, 4, 2, 5, 3, 1];

  // State to track current bird index for each category
  const [currentIndices, setCurrentIndices] = useState(categories.map(() => 0));

  // State to track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // State to track which category square is being hovered
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const handlePrevious = (categoryIndex) => {
    setCurrentIndices((prev) => {
      const newIndices = [...prev];
      const totalBirds = categories[categoryIndex].species.length;
      newIndices[categoryIndex] =
        (prev[categoryIndex] - 1 + totalBirds) % totalBirds;
      return newIndices;
    });
  };

  const handleNext = (categoryIndex) => {
    setCurrentIndices((prev) => {
      const newIndices = [...prev];
      const totalBirds = categories[categoryIndex].species.length;
      newIndices[categoryIndex] = (prev[categoryIndex] + 1) % totalBirds;
      return newIndices;
    });
  };

  const toggleExpanded = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
    // Reset expandAll when user manually toggles a category
    if (setExpandAll) setExpandAll(null);
  };

  // Handle expand all / collapse all
  useEffect(() => {
    if (expandAll === true) {
      // Expand all categories that have carousels (more than 4 species)
      const allExpandableIds = categories
        .filter(cat => cat.species.length > 4)
        .map(cat => cat.category_id);
      setExpandedCategories(new Set(allExpandableIds));
    } else if (expandAll === false) {
      // Collapse all categories
      setExpandedCategories(new Set());
    }
    // If expandAll is null, do nothing (user has manual control)
  }, [expandAll]); // categories is derived from static data, doesn't need to be a dependency

  // Calculate max values for different metrics
  const globalMaxPerHour = Math.max(
    ...categories.flatMap(category =>
      category.species.flatMap(bird => [bird.per_hour_2022, bird.per_hour_2024])
    )
  );

  const globalMaxCount = Math.max(
    ...categories.flatMap(category =>
      category.species.flatMap(bird => [bird.count_2022, bird.count_2024])
    )
  );

  // Use per_hour when both years shown, count when single year shown
  const bothYearsShown = show2022 && show2024;
  const globalMaxValue = bothYearsShown ? globalMaxPerHour : globalMaxCount;

  return (
    <Box py="6">
      {categories.map((category, index) => {
        const columnStart = columnPositions[index];
        const currentBirdIndex = currentIndices[index];
        const isExpanded = expandedCategories.has(category.category_id);
        const prevCategoryExpanded = index > 0 && expandedCategories.has(categories[index - 1].category_id);
        const nextCategoryExpanded = index < categories.length - 1 && expandedCategories.has(categories[index + 1].category_id);

        const hasCarousel = category.species.length > 4;

        // Get pre-calculated category percent change
        const categoryChange = category.categoryChange;
        const categoryChangeDisplay = categoryChange > 0 ? `+${categoryChange.toFixed(0)}%` : `${categoryChange.toFixed(0)}%`;

        // Calculate totals for each year (raw counts for single year display)
        const totalCount2022 = category.species.reduce((sum, bird) => sum + bird.count_2022, 0);
        const totalCount2024 = category.species.reduce((sum, bird) => sum + bird.count_2024, 0);

        // Determine what to display in category card based on toggles
        const getCategoryMetric = () => {
          const only2022 = show2022 && !show2024;
          const only2024 = !show2022 && show2024;
          const neitherYear = !show2022 && !show2024;

          if (neitherYear) {
            return { display: "", showStat: false };
          } else if (only2022) {
            return { display: `${totalCount2022} observed`, showStat: true, color: "var(--circle-outer)" };
          } else if (only2024) {
            return { display: `${totalCount2024} observed`, showStat: true, color: "var(--circle-inner)" };
          } else {
            // Both years showing - use percentage change
            return {
              display: categoryChangeDisplay,
              showStat: true,
              color: categoryChange > 0 ? "#4CAF50" : categoryChange < 0 ? "#E84A5F" : "var(--foreground)"
            };
          }
        };

        const categoryMetric = getCategoryMetric();

        const getBirdsToDisplay = () => {
          const birds = Array(5).fill(null);
          const categoryIndex = columnStart - 1;

          // Set category square position
          birds[categoryIndex] = null;

          if (hasCarousel) {
            // Fill all 4 positions with carousel
            let birdCount = 0;
            for (let i = 0; i < 5; i++) {
              if (i !== categoryIndex) {
                const birdIndex =
                  (currentBirdIndex + birdCount) % category.species.length;
                birds[i] = category.species[birdIndex];
                birdCount++;
              }
            }
          } else {
            // Fill positions closest to category square first
            const availablePositions = [];
            for (let i = 0; i < 5; i++) {
              if (i !== categoryIndex) {
                availablePositions.push(i);
              }
            }

            // Sort by distance from category square
            availablePositions.sort((a, b) => {
              const distA = Math.abs(a - categoryIndex);
              const distB = Math.abs(b - categoryIndex);
              return distA - distB;
            });

            // Fill closest positions first
            for (let i = 0; i < Math.min(category.species.length, 4); i++) {
              birds[availablePositions[i]] = category.species[i];
            }
          }

          return birds;
        };

        const birdsToDisplay = getBirdsToDisplay();

        return (
          <Box
            key={category.category_id}
            style={{
              paddingTop: (index === 0 || isExpanded || prevCategoryExpanded) ? 0 : "2rem",
              marginBottom: isExpanded && nextCategoryExpanded ? "0" : (isExpanded ? "1.5rem" : "2.5rem"),
              marginLeft: isExpanded ? "-1.5rem" : "0",
              marginRight: isExpanded ? "-1.5rem" : "0",
              transition: "border-color 0s",
              borderLeft: isExpanded ? `4px solid ${category.color}` : "none",
              paddingLeft: isExpanded ? "calc(1.5rem - 3px)" : "0",
              paddingRight: isExpanded ? "1.5rem" : "0"
            }}
          >
            <Box
              onClick={isExpanded ? () => toggleExpanded(category.category_id) : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                width: "100%",
                backgroundColor: "transparent",
                paddingTop: isExpanded ? (index === 0 ? '0' : '1.5rem') : "0",
                paddingRight: isExpanded ? "calc(40px + 1rem)" : (!hasCarousel ? "calc(40px + 1rem)" : "0"),
                paddingBottom: isExpanded ? "1.5rem" : "0",
                paddingLeft: isExpanded ? "calc(40px + 1rem)" : (!hasCarousel ? "calc(40px + 1rem)" : "0"),
                transition: "background-color 0.3s ease"
              }}
            >
              {hasCarousel && !isExpanded && (
                <Box
                  style={{
                    width: "40px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <IconButton
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevious(index);
                    }}
                    size="3"
                    style={{ cursor: "pointer", color: "var(--foreground)" }}
                  >
                    <ChevronLeftIcon width="24" height="24" />
                  </IconButton>
                </Box>
              )}

              <Box style={{ flex: 1, minWidth: 0 }}>
                <Grid
                  columns="5"
                  gap="4"
                  style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
                >
                  {birdsToDisplay.map((bird, gridIndex) => {
                    // Category square
                    if (gridIndex === columnStart - 1) {
                      const isHovered = hoveredCategory === category.category_id;
                      const showFilledState = (isExpanded || isHovered) && hasCarousel;

                      return (
                        <Box
                          key={`category-${index}`}
                          onClick={hasCarousel ? (e) => {
                            e.stopPropagation();
                            toggleExpanded(category.category_id);
                          } : undefined}
                          onMouseEnter={() => setHoveredCategory(category.category_id)}
                          onMouseLeave={() => setHoveredCategory(null)}
                          style={{
                            backgroundColor: showFilledState ? category.color : "transparent",
                            border: showFilledState ? "none" : `1px solid ${category.color}`,
                            aspectRatio: "1 / 1",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            padding: "1rem",
                            minWidth: 0,
                            overflow: "hidden",
                            cursor: hasCarousel ? "pointer" : "default",
                            position: "relative",
                            transition: "border 0.3s ease, background-color 0.3s ease"
                          }}
                        >
                          {/* Category name - Hero element */}
                          <Box style={{ width: "100%" }}>
                            <Text
                              weight="bold"
                              style={{
                                fontSize: "1.5rem",
                                lineHeight: "1.1",
                                display: "block",
                                wordBreak: "break-word",
                                color: showFilledState ? "var(--background)" : "var(--foreground)",
                                transition: "color 0.3s ease"
                              }}
                            >
                              {category.name}
                            </Text>
                          </Box>

                          {/* Bottom section - Stats */}
                          <Box style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            {categoryMetric.showStat && (
                              <Text
                                weight="bold"
                                style={{
                                  fontSize: "1.25rem",
                                  lineHeight: "1",
                                  color: showFilledState
                                    ? "var(--background)"
                                    : categoryMetric.color,
                                  transition: "color 0.3s ease"
                                }}
                              >
                                {categoryMetric.display}
                              </Text>
                            )}
                            <Text
                              size="1"
                              style={{
                                fontSize: "0.75rem",
                                opacity: 0.7,
                                color: showFilledState ? "var(--background)" : "var(--foreground)",
                                transition: "color 0.3s ease"
                              }}
                            >
                              {!hasCarousel && isHovered
                                ? "That's all!"
                                : hasCarousel && isHovered && !isExpanded
                                ? `Click to see more`
                                : hasCarousel && isHovered && isExpanded
                                ? "Click to see less"
                                : `${category.species_count} species`}
                            </Text>
                          </Box>
                        </Box>
                      );
                    } else if (bird === null) {
                      // Empty slot
                      return (
                        <Box
                          key={`empty-${index}-${gridIndex}`}
                          style={{
                            aspectRatio: "1 / 1",
                            minWidth: 0
                          }}
                        />
                      );
                    } else {
                      // Bird square
                      const isZeroCount = (show2022 && !show2024 && bird.count_2022 === 0) ||
                                         (!show2022 && show2024 && bird.count_2024 === 0);

                      return (
                        <Box
                          key={`bird-${index}-${gridIndex}`}
                          style={{
                            backgroundColor: "var(--background)",
                            aspectRatio: "1 / 1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0.5rem",
                            minWidth: 0,
                            overflow: "hidden",
                            transition: "background-color 0.3s ease, opacity 0.3s ease",
                            opacity: isZeroCount ? 0.3 : 1
                          }}
                        >
                          <BirdPopulationCircle
                            species={bird}
                            categoryMaxValue={globalMaxValue}
                            show2022={show2022}
                            show2024={show2024}
                          />
                        </Box>
                      );
                    }
                  })}
                </Grid>
              </Box>

              {hasCarousel && !isExpanded && (
                <Box
                  style={{
                    width: "40px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <IconButton
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext(index);
                    }}
                    size="3"
                    style={{ cursor: "pointer", color: "var(--foreground)" }}
                  >
                    <ChevronRightIcon width="24" height="24" />
                  </IconButton>
                </Box>
              )}
            </Box>

            {/* Expanded bird grid */}
            {isExpanded && (
              <Box
                onClick={() => toggleExpanded(category.category_id)}
                pb="6"
                pt="4"
                style={{
                  animation: "expandDown 0.3s ease-out",
                  backgroundColor: "var(--background)",
                  paddingLeft: "calc(40px + 1rem)",
                  paddingRight: "calc(40px + 1rem)"
                }}
              >
                <Grid
                  columns="5"
                  gap="4"
                  style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
                >
                  {category.species
                    .filter((_, birdIndex) => {
                      // Get the indices of birds currently showing in carousel
                      const currentlyShowing = [];
                      let birdCount = 0;
                      for (let i = 0; i < 5; i++) {
                        if (i !== columnStart - 1) {
                          const displayBirdIndex = (currentBirdIndex + birdCount) % category.species.length;
                          currentlyShowing.push(displayBirdIndex);
                          birdCount++;
                        }
                      }
                      // Only show birds NOT in carousel
                      return !currentlyShowing.includes(birdIndex);
                    })
                    .map((bird, filteredIndex) => {
                      const isZeroCount = (show2022 && !show2024 && bird.count_2022 === 0) ||
                                         (!show2022 && show2024 && bird.count_2024 === 0);

                      return (
                        <Box
                          key={`expanded-bird-${index}-${filteredIndex}`}
                          style={{
                            backgroundColor: "var(--background)",
                            aspectRatio: "1 / 1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0.5rem",
                            minWidth: 0,
                            overflow: "hidden",
                            transition: "opacity 0.3s ease",
                            opacity: isZeroCount ? 0.3 : 1
                          }}
                        >
                          <BirdPopulationCircle
                            species={bird}
                            categoryMaxValue={globalMaxValue}
                            show2022={show2022}
                            show2024={show2024}
                          />
                        </Box>
                      );
                    })}
                </Grid>
              </Box>
            )}
          </Box>
        );
      })}
      <style jsx global>{`
        @keyframes expandDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  );
}
