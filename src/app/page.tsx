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

  const calculateCombinations = () => {
    let belowDiagonal = 0;
    let onDiagonal = 0;
    let aboveDiagonal = 0;

    for (let i = 0; i < ranks.length; i++) {
      for (let j = 0; j < ranks.length; j++) {
        const itemKey = `${ranks[j]}${ranks[i]}`;
        if (toggledItems.has(itemKey)) {
          if (i > j) {
            belowDiagonal++;
          } else if (i === j) {
            onDiagonal++;
          } else {
            aboveDiagonal++;
          }
        }
      }
    }

    return (12 * belowDiagonal) + (6 * onDiagonal) + (4 * aboveDiagonal);
  };


  return (
    <main className={styles.main}>
      <div className={styles.grid}>
        {generateGridItems()}
      </div>
      <div>
        Number of Combinations: {calculateCombinations()}
      </div>

    </main>
  );
}
