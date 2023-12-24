"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

type CardRank = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

export default function Home() {
  // Define ranks for poker cards
  const ranks: CardRank[] = ['A', 'K', 'Q', 'J', '9', '8', '7', '6', '5', '4', '3', '2'];

  // State to track the toggled items
  const [toggledItems, setToggledItems] = useState<Set<String>>(new Set());

  // Function to generate grid items
  const generateGridItems = () => {
    let gridItems = [];
    for (let i = 0; i < ranks.length; i++) {
      for (let j = 0; j < ranks.length; j++) {
        // Generate a unique key for each item
        // but always put ace between king and queen, and king between queen and jack, etc.
        const itemKey = `${ranks[j]}${ranks[i]}`;
        const itemDisplay = (ranks[j] === "A" || (ranks[j] === "K" && ranks[i] !== "A") || (ranks[j] === "Q" && ranks[i] !== "A" && ranks[i] !== "K")) ? `${ranks[j]}${ranks[i]}` : `${ranks[i]}${ranks[j]}`;
        gridItems.push(
          <div
            key={itemKey}
            className={`${styles.gridItem} ${toggledItems.has(itemKey) ? styles.toggled : ''}`}
            onClick={() => toggleItem(itemKey)}
          >
            {itemDisplay}
          </div>
        );
      }
    }
    return gridItems;
  };

  // Function to handle item toggle
  const toggleItem = (itemKey: string) => {
    const newToggledItems = new Set(toggledItems);
    if (toggledItems.has(itemKey)) {
      // make a new set identical to toggledItems but without the item
      newToggledItems.delete(itemKey);
    }
    else {
      newToggledItems.add(itemKey);
    }
    setToggledItems(newToggledItems);
  };

  const calculateCombinations: () => {
    combinations: number;
    combinationsByRank: Record<CardRank, number>;
  } = () => {
    let totals = {
      combinations: 0,
      combinationsByRank: {} as Record<CardRank, number>
    };
    for (let rank of ranks) {
      totals.combinationsByRank[rank] = 0;
    }


    for (let i = 0; i < ranks.length; i++) {
      for (let j = 0; j < ranks.length; j++) {
        const itemKey = `${ranks[j]}${ranks[i]}`;
        if (toggledItems.has(itemKey)) {
          const multiplier = i > j ? 12 : i === j ? 6 : 4;
          totals.combinations += multiplier;

          // Check for each rank
          for (let rank of ranks) {
            const exactlyOneRank = (ranks[j] === rank && ranks[i] !== rank) || (ranks[j] !== rank && ranks[i] === rank);
            if (exactlyOneRank) {
              totals.combinationsByRank[rank] += multiplier;
            }
          }
        }
      }
    }

    return totals;
  };

  const { combinations, combinationsByRank } = calculateCombinations();

  return (
    <main className={styles.main}>
      <div className={styles.grid}>
        {generateGridItems()}
      </div>
      <div>
        <div>Combos: {combinations}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "4rem 2rem 3rem", gridGap: "6px", marginTop: "10px" }}>
        {ranks.map(rank => (
          <React.Fragment key={rank}>
            <div><span style={{ opacity: 0.5 }}>W/ 1</span> {rank}:</div>
            <div>
              {combinationsByRank[rank]}
            </div>
            <div>
              ({combinations !== 0 ? Math.round((combinationsByRank[rank] / combinations) * 1000) / 10 : 0}%)
            </div>
          </React.Fragment>
        ))}
      </div>
    </main>
  );
}
