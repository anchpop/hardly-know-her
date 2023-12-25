"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

type CardRank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

export default function Home() {
  // Define ranks for poker cards
  const ranks: CardRank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

  // State to track the toggled items
  const [toggledItems1, setToggledItems1] = useState<Set<String>>(new Set());
  const [toggledItems2, setToggledItems2] = useState<Set<String>>(new Set());

  // Function to generate grid items
  const generateGridItems = (toggledItems: Set<String>, setToggledItems: React.Dispatch<React.SetStateAction<Set<String>>>) => {
    let gridItems = [];
    for (let i = 0; i < ranks.length; i++) {
      for (let j = 0; j < ranks.length; j++) {
        // Generate a unique key for each item
        // but always put ace between king and queen, and king between queen and jack, etc.
        const itemKey = `${ranks[j]}${ranks[i]}`;
        const itemDisplay = (ranks[j] === "A" || (ranks[j] === "K" && ranks[i] !== "A") || (ranks[j] === "Q" && ranks[i] !== "A" && ranks[i] !== "K") || (ranks[j] === "T" && ranks[i] !== "A" && ranks[i] !== "K" && ranks[i] !== "Q")) ? `${ranks[j]} ${ranks[i]}` : `${ranks[i]} ${ranks[j]}`;
        gridItems.push(
          <div
            key={itemKey}
            className={`${styles.gridItem} ${toggledItems.has(itemKey) ? styles.toggled : ''}`}
            onClick={() => toggleItem(itemKey, toggledItems, setToggledItems)}
          >
            {itemDisplay}
          </div>
        );
      }
    }
    return gridItems;
  };

  // Function to handle item toggle
  const toggleItem = (itemKey: string, toggledItems: Set<String>, setToggledItems: React.Dispatch<React.SetStateAction<Set<String>>>) => {
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

  const calculateCombinations: (toggledItems: Set<String>) => {
    combinations: number;
    combinationsByRank: Record<CardRank, number>;
  } = (toggledItems: Set<String>) => {
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

  const comboInfo1 = calculateCombinations(toggledItems1);
  const comboInfo2 = calculateCombinations(toggledItems2);

  return (
    <main className={styles.main}>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", width: "100%" }}>
        <div className={styles.grid}>
          {generateGridItems(toggledItems1, setToggledItems1)}
        </div>
        <div className={styles.grid}>
          {generateGridItems(toggledItems2, setToggledItems2)}
        </div>
      </div>
      <div>
        <div>Combos: {comboInfo1.combinations}</div>
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "4rem 2rem 2rem 3rem 2rem 2rem 4rem", gridGap: "6px", marginTop: "10px",
      }}>
        {ranks.map(rank => (
          <React.Fragment key={rank}>
            <div>
              ({comboInfo1.combinations !== 0 ? Math.round((comboInfo1.combinationsByRank[rank] / comboInfo1.combinations) * 1000) / 10 : 0}%)
            </div>
            <div>
              {comboInfo1.combinationsByRank[rank]}
            </div>
            <div> {rank} </div>
            <div>
              <span style={{ opacity: 0.5 }}>W/ 1</span>
            </div>
            <div> {rank} </div>
            <div>
              {comboInfo2.combinationsByRank[rank]}
            </div>
            <div>
              ({comboInfo2.combinations !== 0 ? Math.round((comboInfo2.combinationsByRank[rank] / comboInfo2.combinations) * 1000) / 10 : 0}%)
            </div>
          </React.Fragment>
        ))}
      </div>
    </main >
  );
}
