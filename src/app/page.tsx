"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

type CardRank =
  | "A"
  | "K"
  | "Q"
  | "J"
  | "T"
  | "9"
  | "8"
  | "7"
  | "6"
  | "5"
  | "4"
  | "3"
  | "2";

function formatNumber(num: number) {
  // Split the number on the decimal point
  let parts = num.toString().split(".");

  // Pad the integer part to ensure it has at least two digits
  parts[0] = parts[0].padStart(2, "0");

  // If there is a decimal part, format it to have exactly one digit
  if (parts[1]) {
    parts[1] =
      parts[1].length > 1 ? parts[1].substring(0, 1) : parts[1].padEnd(1, "0");
  } else {
    // If there wasn't a decimal part, add ".0"
    parts.push("0");
  }

  // Join the parts back together
  return parts.join(".");
}

export default function Home() {
  // Define ranks for poker cards
  const ranks: CardRank[] = [
    "A",
    "K",
    "Q",
    "J",
    "T",
    "9",
    "8",
    "7",
    "6",
    "5",
    "4",
    "3",
    "2",
  ];

  // State to track the toggled items
  const [toggledItems1, setToggledItems1] = useState<Set<String>>(new Set());
  const [toggledItems2, setToggledItems2] = useState<Set<String>>(new Set());

  // Function to generate grid items
  const generateGridItems = (
    toggledItems: Set<String>,
    setToggledItems: React.Dispatch<React.SetStateAction<Set<String>>>,
  ) => {
    let gridItems = [];
    for (let i = 0; i < ranks.length; i++) {
      for (let j = 0; j < ranks.length; j++) {
        // Generate a unique key for each item
        // but always put ace between king and queen, and king between queen and jack, etc.
        const itemKey = `${ranks[j]}${ranks[i]}`;
        const itemDisplay =
          ranks[j] === "A" ||
            (ranks[j] === "K" && ranks[i] !== "A") ||
            (ranks[j] === "Q" && ranks[i] !== "A" && ranks[i] !== "K") ||
            (ranks[j] === "J" &&
              ranks[i] !== "A" &&
              ranks[i] !== "K" &&
              ranks[i] !== "Q") ||
            (ranks[j] === "T" &&
              ranks[i] !== "A" &&
              ranks[i] !== "K" &&
              ranks[i] !== "Q" &&
              ranks[i] !== "J")
            ? `${ranks[j]}${ranks[i]}`
            : `${ranks[i]}${ranks[j]}`;
        gridItems.push(
          <div
            key={itemKey}
            className={`${styles.gridItem} ${toggledItems.has(itemKey) ? styles.toggled : ""
              }`}
            onClick={() => toggleItem(itemKey, toggledItems, setToggledItems)}
          >
            {itemDisplay}
          </div>,
        );
      }
    }
    return gridItems;
  };

  // Function to handle item toggle
  const toggleItem = (
    itemKey: string,
    toggledItems: Set<String>,
    setToggledItems: React.Dispatch<React.SetStateAction<Set<String>>>,
  ) => {
    const newToggledItems = new Set(toggledItems);
    if (toggledItems.has(itemKey)) {
      // make a new set identical to toggledItems but without the item
      newToggledItems.delete(itemKey);
    } else {
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
      combinationsByRank: {} as Record<CardRank, number>,
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
            const exactlyOneRank =
              (ranks[j] === rank && ranks[i] !== rank) ||
              (ranks[j] !== rank && ranks[i] === rank);
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

  const [gameMode, setGameMode] = useState<boolean>(false);

  const initialGuesses = {
    "A": undefined,
    "K": undefined,
    "Q": undefined,
    "J": undefined,
    "T": undefined,
    "9": undefined,
    "8": undefined,
    "7": undefined,
    "6": undefined,
    "5": undefined,
    "4": undefined,
    "3": undefined,
    "2": undefined,
  }
  const [guesses, setGuesses] = useState<{ [key in CardRank]: "g1" | "g2" | "both" | undefined }>(initialGuesses);

  const guessResult = (rank: CardRank): boolean => {
    if (guesses[rank] === undefined) {
      return false;
    }
    if (comboInfo1.combinations === 0 || comboInfo2.combinations === 0) {
      return false;
    }
    let g1Percent = comboInfo1.combinationsByRank[rank] / comboInfo1.combinations;
    let g2Percent = comboInfo2.combinationsByRank[rank] / comboInfo2.combinations;
    if (guesses[rank] === "both") {
      return Math.abs(g1Percent - g2Percent) < 0.02;
    }
    if (guesses[rank] === "g1") {
      return g1Percent > g2Percent;
    }
    if (guesses[rank] === "g2") {
      return g1Percent < g2Percent;
    }
    return false;
  }
  const guessedCorrectly = {
    "A": guessResult("A"),
    "K": guessResult("K"),
    "Q": guessResult("Q"),
    "J": guessResult("J"),
    "T": guessResult("T"),
    "9": guessResult("9"),
    "8": guessResult("8"),
    "7": guessResult("7"),
    "6": guessResult("6"),
    "5": guessResult("5"),
    "4": guessResult("4"),
    "3": guessResult("3"),
    "2": guessResult("2"),
  }

  return (
    <main className={styles.main}>
      <div className={styles.gridContainer}>
        <div style={{ width: "100%" }}>
          <div className={`${styles.cardGrid} ${styles.g1}`}>
            {generateGridItems(toggledItems1, setToggledItems1)}
          </div>
          <div className={styles.combos}>Combos: {comboInfo1.combinations}</div>
        </div>
        <div style={{ width: "100%" }}>
          <div className={`${styles.cardGrid} ${styles.g2}`}>
            {generateGridItems(toggledItems2, setToggledItems2)}
          </div>
          <div>
            <div className={styles.combos}>
              Combos: {comboInfo2.combinations}
            </div>
          </div>
        </div>
      </div>
      <div className={`${styles.gameButtons}`}>
        <button
          className={styles.bigButton}
          onClick={() => {
            setToggledItems1(new Set());
            setToggledItems2(new Set());
            setGuesses(initialGuesses);
          }}
        >
          Clear board
        </button>
        <button
          className={styles.bigButton}
          onClick={() => setGameMode(!gameMode)}
        >
          🎮 <b>{gameMode ? "Poker???" : "I hardly know her!!!"}</b> 🃏
        </button>
      </div>
      <div
        className={`${gameMode ? styles.gameContainer : ""} ${styles.comboGrid
          }`}
      >
        {ranks.map((rank) => (
          <div key={rank} className={`${styles.comboRow} ${gameMode ? "" : guessedCorrectly[rank] ? styles.correctComboRow : styles.incorrectComboRow}`}>
            {/* percentage */}
            <div
              className={`${styles.answer} ${styles.percentageCombo}`}
              style={{ textAlign: "right" }}
            >
              (
              {formatNumber(
                comboInfo1.combinations !== 0
                  ? Math.round(
                    (comboInfo1.combinationsByRank[rank] /
                      comboInfo1.combinations) *
                    1000,
                  ) / 10
                  : 0,
              )}
              %)
            </div>

            {/* absolute number */}
            <div style={{ textAlign: "center" }} className={`${styles.answer}`}>
              {comboInfo1.combinationsByRank[rank]}
            </div>

            {/* rank */}
            <div onClick={() => setGuesses({ ...guesses, [rank]: guesses[rank] === "g1" ? undefined : "g1" })}>
              <div className={`${guesses[rank] === "g1" ? styles.selected : ""} ${styles.g1} ${styles.rank}`}>{rank}</div>
            </div>

            {/* separator */}
            <div style={{ textAlign: "center" }} className={`${guesses[rank] === "both" ? styles.selected : ""}`} onClick={() => setGuesses({ ...guesses, [rank]: guesses[rank] === "both" ? undefined : "both" })}>
              <div style={{ opacity: 0.5 }}>W/ 1</div>
            </div>

            {/* rank */}
            <div onClick={() => setGuesses({ ...guesses, [rank]: guesses[rank] === "g2" ? undefined : "g2" })}>
              <div className={`${guesses[rank] === "g2" ? styles.selected : ""} ${styles.g2} ${styles.rank}`}>{rank}</div>
            </div>

            {/* absolute number */}
            <div style={{ textAlign: "center" }} className={`${styles.answer}`}>
              {comboInfo2.combinationsByRank[rank]}
            </div>

            {/* percentage */}
            <div className={`${styles.answer} ${styles.percentageCombo}`}>
              (
              {formatNumber(
                comboInfo2.combinations !== 0
                  ? Math.round(
                    (comboInfo2.combinationsByRank[rank] /
                      comboInfo2.combinations) *
                    1000,
                  ) / 10
                  : 0,
              )}
              %)
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
