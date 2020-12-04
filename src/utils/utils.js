import { last } from "lodash";
import { Suits, Ranks, RankValues } from "../constants/constants.js";

function isSameCard(cardA, cardB) {
  return cardA.suit == cardB.suit && cardA.rank == cardB.rank;
}

function getSuitColor(suit) {
  return suit == "SPADES" || suit == "CLUBS" ? "BLACK" : "RED";
}

function getRankDifference(cardA, cardB) {
  // cardA - cardB; ie., Jack - 10 = 1
  return RankValues[cardA.rank] - RankValues[cardB.rank];
}

export function isTableauPositionValid(from, to) {
  // can move a King onto an empty pile
  if (!to.suit) return from.rank == "K";

  // can move a card onto another pile that has
  // opposite color and one rank higher
  let suitValid = getSuitColor(from.suit) !== getSuitColor(to.suit);
  let rankValid = getRankDifference(to, from) == 1;
  return suitValid && rankValid;
}

export function isFoundationPositionValid(from, to, fromPile) {
  // cannot play non-top card in tableau to foundation
  if (fromPile) {
    let top = last(fromPile);
    if (!isSameCard(top, from)) return false;
  }

  // can play ace on empty foundation
  if (!to.suit) {
    return from.rank === "A";
  }

  // can play same suit and 1 rank higher on foundation
  if (to.suit === from.suit && getRankDifference(to, from) === -1) {
    return true;
  }

  return false;
}

export function buildDeck() {
  let deck = [];
  Object.keys(Suits).forEach((suit) => {
    Ranks.forEach((rank) => {
      const card = {
        rank,
        suit,
        faceup: true,
        location: "DECK",
      };
      deck.push(card);
    });
  });
  return deck;
}
