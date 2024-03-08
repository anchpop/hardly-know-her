"use client";

import React, { useState } from "react";
import styles from "./page.module.css";

type CardRank = "A" | "K" | "Q" | "J" | "T" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2";
type HandType = "suited" | "offsuit" | "pair";
type HandKey = `${CardRank}${CardRank}`;
type GuessValue = "g1" | "g2" | "both";

const ranks: CardRank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];

function formatNumber(num: number) {
  const [integerPart, decimalPart] = num.toFixed(1).split(".");
  return `${integerPart.padStart(2, "0")}.${decimalPart}`;
}

function getHandInfo(handKey: HandKey): { handType: HandType; higherRank: CardRank; lowerRank: CardRank } {
  const [rank1, rank2] = handKey.split("") as [CardRank, CardRank];
  const lowerRank = ranks.indexOf(rank1) < ranks.indexOf(rank2) ? rank1 : rank2;
  const higherRank = ranks.indexOf(rank1) < ranks.indexOf(rank2) ? rank2 : rank1;

  if (higherRank === lowerRank) {
    return { handType: "pair", higherRank, lowerRank };
  }

  const isSuited = ranks.indexOf(rank1) > ranks.indexOf(rank2);
  return {
    handType: isSuited ? "suited" : "offsuit",
    higherRank,
    lowerRank,
  };
}

function calculateCombinations(toggledItems: Set<HandKey>) {
  const combinationsByRank: Record<CardRank, number> = ranks.reduce((acc, rank) => {
    acc[rank] = 0;
    return acc;
  }, {} as Record<CardRank, number>);

  let totalCombinations = 0;

  for (const handKey of toggledItems) {
    const itemInfo = getHandInfo(handKey);
    const { higherRank, lowerRank } = getHandInfo(handKey);
    const combos = itemInfo.handType === "pair" ? 6 : itemInfo.handType === "suited" ? 4 : 12;
    totalCombinations += combos;
    combinationsByRank[higherRank] += combos;
    combinationsByRank[lowerRank] += combos;
  }

  return { totalCombinations, combinationsByRank };
}

export default function Home() {
  const [toggledItems1, setToggledItems1] = useState<Set<HandKey>>(new Set());
  const [toggledItems2, setToggledItems2] = useState<Set<HandKey>>(new Set());
  const [gameMode, setGameMode] = useState(false);
  const [guesses, setGuesses] = useState<Record<CardRank, GuessValue | undefined>>({
    A: undefined,
    K: undefined,
    Q: undefined,
    J: undefined,
    T: undefined,
    "9": undefined,
    "8": undefined,
    "7": undefined,
    "6": undefined,
    "5": undefined,
    "4": undefined,
    "3": undefined,
    "2": undefined,
  });

  const { totalCombinations: totalCombinations1, combinationsByRank: combinationsByRank1 } = calculateCombinations(toggledItems1);
  const { totalCombinations: totalCombinations2, combinationsByRank: combinationsByRank2 } = calculateCombinations(toggledItems2);

  const toggleItem = (handKey: HandKey, toggledItems: Set<HandKey>, setToggledItems: React.Dispatch<React.SetStateAction<Set<HandKey>>>) => {
    const newToggledItems = new Set(toggledItems);
    if (toggledItems.has(handKey)) {
      newToggledItems.delete(handKey);
    } else {
      newToggledItems.add(handKey);
    }
    setToggledItems(newToggledItems);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, handKey: HandKey, toggledItems: Set<HandKey>, setToggledItems: React.Dispatch<React.SetStateAction<Set<HandKey>>>) => {
    let clickIndex = e.detail % 3;
    console.log(e.detail);
    if (clickIndex == 1) {
      toggleItem(handKey, toggledItems, setToggledItems);
    }
    else {
      toggleBetterItems(handKey, toggledItems, setToggledItems)
    }
  }

  const toggleBetterItems = (handKey: HandKey, toggledItems: Set<HandKey>, setToggledItems: React.Dispatch<React.SetStateAction<Set<HandKey>>>) => {
    const strictlyBetterHands = new Set<HandKey>();
    const itemInfo = getHandInfo(handKey);

    for (const higherRank of ranks) {
      for (const lowerRank of ranks) {
        const otherHandKey: HandKey = `${higherRank}${lowerRank}` as HandKey;
        const otherItemInfo = getHandInfo(otherHandKey);

        if (itemInfo.handType === otherItemInfo.handType) {
          let strictlyBetter = false;

          if (itemInfo.handType === "pair") {
            strictlyBetter = ranks.indexOf(otherItemInfo.higherRank) > ranks.indexOf(itemInfo.higherRank);
          } else {
            const otherLowerIndex = ranks.indexOf(otherItemInfo.lowerRank);
            const itemLowerIndex = ranks.indexOf(itemInfo.lowerRank);
            const otherHigherIndex = ranks.indexOf(otherItemInfo.higherRank);
            const itemHigherIndex = ranks.indexOf(itemInfo.higherRank);

            if (itemInfo.handType === "suited" || itemInfo.handType === "offsuit") {
              strictlyBetter = (otherLowerIndex >= itemLowerIndex && otherHigherIndex >= itemHigherIndex) && (otherLowerIndex > itemLowerIndex || otherHigherIndex > itemHigherIndex)
            }
          }

          if (strictlyBetter) {
            strictlyBetterHands.add(otherHandKey);
          }
        }
      }
    }


    const newToggledItems = new Set(toggledItems);
    const allBetterHandsAreToggled = Array.from(strictlyBetterHands).every((betterHandKey) => newToggledItems.has(betterHandKey));

    if (allBetterHandsAreToggled) {
      strictlyBetterHands.forEach((handKey) => newToggledItems.delete(handKey));
      newToggledItems.delete(handKey);
    } else {
      strictlyBetterHands.forEach((handKey) => newToggledItems.add(handKey));
      newToggledItems.add(handKey);
    }

    setToggledItems(newToggledItems);
  };

  function generateGridItems(toggledItems: Set<HandKey>, setToggledItems: React.Dispatch<React.SetStateAction<Set<HandKey>>>) {
    const gridItems = [];
    for (let i = ranks.length - 1; i >= 0; i--) {
      for (let j = ranks.length - 1; j >= 0; j--) {
        const handKey: HandKey = `${ranks[i]}${ranks[j]}` as HandKey;
        const isSuited = i < j;
        const itemDisplay = isSuited ? handKey : `${ranks[j]}${ranks[i]}`;
        gridItems.push(
          <div
            key={handKey}
            className={`${styles.gridItem} ${toggledItems.has(handKey) ? styles.toggled : ""}`}
            onClick={(e) => handleClick(e, handKey, toggledItems, setToggledItems)}
          >
            {itemDisplay}
          </div>
        );
      }
    }
    return gridItems;
  }

  const guessResult = (rank: CardRank): boolean => {
    if (guesses[rank] === undefined) {
      return false;
    }
    if (totalCombinations1 === 0 || totalCombinations2 === 0) {
      return false;
    }
    const g1Percent = combinationsByRank1[rank] / totalCombinations1;
    const g2Percent = combinationsByRank2[rank] / totalCombinations2;
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
  };

  const guessedCorrectly: Record<CardRank, boolean> = ranks.reduce((acc, rank) => {
    acc[rank] = guessResult(rank);
    return acc;
  }, {} as Record<CardRank, boolean>);

  return (
    <main className={styles.main}>
      <div className={styles.gridContainer}>
        <div style={{ width: "100%" }}>
          <div className={`${styles.cardGrid} ${styles.g1}`}>{generateGridItems(toggledItems1, setToggledItems1)}</div>
          <div className={styles.combos}>Combos: {totalCombinations1}</div>
        </div>
        <div style={{ width: "100%" }}>
          <div className={`${styles.cardGrid} ${styles.g2}`}>{generateGridItems(toggledItems2, setToggledItems2)}</div>
          <div className={styles.combos}>Combos: {totalCombinations2}</div>
        </div>
      </div>
      <div className={styles.gameButtons}>
        <button
          className={styles.bigButton}
          onClick={() => {
            setToggledItems1(new Set());
            setToggledItems2(new Set());
            setGuesses(ranks.reduce((acc, rank) => {
              acc[rank] = undefined;
              return acc;
            }, {} as Record<CardRank, GuessValue | undefined>));
          }}
        >
          Clear board
        </button>
        <button className={styles.bigButton} onClick={() => setGameMode(!gameMode)}>
          🎮 <b>{gameMode ? "Game Mode Completed" : "Game Mode Activate"}</b> 🃏
        </button>
      </div>
      <div className={`${gameMode ? styles.gameContainer : ""} ${styles.comboGrid}`}>
        {ranks.map((rank) => (
          <div key={rank} className={`${styles.comboRow} ${gameMode ? "" : guessedCorrectly[rank] ? styles.correctComboRow : styles.incorrectComboRow}`}>
            <div className={`${styles.answer} ${styles.percentageCombo}`} style={{ textAlign: "right" }}>
              (
              {formatNumber(
                totalCombinations1 !== 0
                  ? Math.round(
                    (combinationsByRank1[rank] /
                      totalCombinations1) *
                    1000,
                  ) / 10
                  : 0,
              )}
              %)
            </div>
            <div style={{ textAlign: "center" }} className={styles.answer}>
              {combinationsByRank1[rank]}
            </div>
            <div onClick={() => setGuesses({ ...guesses, [rank]: guesses[rank] === "g1" ? undefined : "g1" })}>
              <div className={`${guesses[rank] === "g1" ? styles.selected : ""} ${styles.g1} ${styles.rank}`}>{rank}</div>
            </div>
            <div style={{ textAlign: "center" }} className={`${guesses[rank] === "both" ? styles.selected : ""}`} onClick={() => setGuesses({ ...guesses, [rank]: guesses[rank] === "both" ? undefined : "both" })}>
              <div style={{ opacity: 0.5 }}>W/ 1</div>
            </div>
            <div onClick={() => setGuesses({ ...guesses, [rank]: guesses[rank] === "g2" ? undefined : "g2" })}>
              <div className={`${guesses[rank] === "g2" ? styles.selected : ""} ${styles.g2} ${styles.rank}`}>{rank}</div>
            </div>
            <div style={{ textAlign: "center" }} className={styles.answer}>
              {combinationsByRank2[rank]}
            </div>
            <div className={`${styles.answer} ${styles.percentageCombo}`}>
              (
              {formatNumber(
                totalCombinations2 !== 0
                  ? Math.round(
                    (combinationsByRank2[rank] /
                      totalCombinations2) *
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
