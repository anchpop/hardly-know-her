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

  const calculateCombinations: () => { combinations: number, combinationsOneAce: number } = () => {
    let belowDiagonal = 0;
    let belowDiagonalOneAce = 0;
    let onDiagonal = 0;
    let onDiagonalOneAce = 0;
    let aboveDiagonal = 0;
    let aboveDiagonalOneAce = 0;

    for (let i = 0; i < ranks.length; i++) {
      for (let j = 0; j < ranks.length; j++) {
        const itemKey = `${ranks[j]}${ranks[i]}`;
        const exactlyOneAce = (ranks[j] === "A" && ranks[i] !== "A") || (ranks[j] !== "A" && ranks[i] === "A");
        if (toggledItems.has(itemKey)) {
          if (i > j) {
            belowDiagonal++;
            if (exactlyOneAce) { belowDiagonalOneAce++; }
          } else if (i === j) {
            onDiagonal++;
            if (exactlyOneAce) { onDiagonalOneAce++; }
          } else {
            aboveDiagonal++;
            if (exactlyOneAce) { aboveDiagonalOneAce++; }
          }
        }
      }
    }

    return { combinations: (12 * belowDiagonal) + (6 * onDiagonal) + (4 * aboveDiagonal), combinationsOneAce: (12 * belowDiagonalOneAce) + (6 * onDiagonalOneAce) + (4 * aboveDiagonalOneAce) };
  };

  const { combinations, combinationsOneAce } = calculateCombinations();
  const combinationsOneAcePercentage = combinations !== 0 ? Math.round((combinationsOneAce / combinations) * 10000) / 100 : 0;

  return (
    <main className={styles.main}>
      <div className={styles.grid}>
        {generateGridItems()}
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridGap: "10px",
        marginTop: "10px",
      }}>
        <div>
          Combos:
        </div>
        <div>
          {combinations}
        </div>
        <div>
          W/ 1 ace:
        </div>
        <div>
          {combinationsOneAce} ({combinationsOneAcePercentage}%)
        </div>
      </div>

    </main>
  );
}
