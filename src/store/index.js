import Vue from "vue";
import Vuex from "vuex";
import { last, findIndex, shuffle, clone } from "lodash";

import {
  isSameCard,
  isFoundationPositionValid,
  isTableauPositionValid,
  buildDeck,
  mod,
} from "../utils/utils.js";
import { Suits, Ranks, GameStates } from "../constants/constants.js";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    selectedCard: null,
    cursorPosition: [0, 0], // [pileIndex, positionIndex]
    deck: [],
    waste: [],
    foundations: [[], [], [], []],
    tableau: [[], [], [], [], [], [], []],
    gameState: GameStates.PLAY,
    cardWidth: 0,
  },
  mutations: {
    SET_CARD_WIDTH(state, width) {
      state.cardWidth = width;
    },
    SET_CURSOR(state, position) {
      if (state.gameState !== GameStates.PLAY) return;

      Vue.set(state, "cursorPosition", position);
    },
    SET_SELECTED(state, card) {
      state.selectedCard = card;
    },
    DRAW_CARD(state) {
      // turn card from deck to waste
      const top = state.deck.pop();
      if (top) {
        top.pileIndex = 1;
        top.faceup = true;
        state.waste.push(top);
      }
    },
    DRAW_CARD_REVERSE(state) {
      // turn card from waste to deck
      const top = state.waste.pop();
      if (top) {
        top.pileIndex = 0;
        top.faceup = false;
        state.deck.push(top);
      }
    },
    FLIP_WASTE(state) {
      // flip over waste stack to draw stack
      if (state.deck.length === 0 && state.waste.length === 0) return;
      state.waste.forEach((card) => {
        card.pileIndex = 0;
        card.faceup = false;
      });
      state.waste.reverse();
      state.deck = state.waste;
      state.waste = [];
    },
    DEAL(state) {
      // deal out tableau stacks
      state.tableau = [];
      for (let i = 0; i < 7; i++) {
        state.tableau[i] = [];
        for (let n = 0; n < i + 1; n++) {
          const card = state.deck.pop();
          card.faceup = n == i ? true : false;
          card.pileIndex = i + 6;
          state.tableau[i].push(card);
        }
      }
    },
    RESET(state) {
      // restart game and build deck
      state.selectedCard = null;
      state.cursorPosition = [0, 0];
      state.foundations = [[], [], [], []];
      state.tableau = [[], [], [], [], [], [], []];
      state.waste = [];
      state.deck = [];
      state.gameState = GameStates.PLAY;
      state.deck = shuffle(buildDeck());
    },
    END_TURN(state) {
      // check for winning state
      let didWin = true;
      state.foundations.forEach((foundation) => {
        if (foundation.length != 13) {
          didWin = false;
          return;
        }
      });
      if (didWin) {
        state.gameState = GameStates.WIN;
      }
    },
    WIN_TEST(state) {
      // reset game state to winning condition
      let foundations = [];
      Object.keys(Suits).forEach((suit, i) => {
        foundations.push([]);
        Ranks.forEach((rank) => {
          const card = {
            rank,
            suit,
            faceup: true,
            pileIndex: i + 2,
          };
          foundations[i].push(card);
        });
      });
      state.foundations = foundations;
      state.tableau = [[], [], [], [], [], [], []];
      state.waste = [];
      state.deck = [];
    },
    REPLACE_PILE(state, { pileIndex, newPile }) {
      newPile.forEach((card) => {
        card.pileIndex = pileIndex;
      });
      if (pileIndex === 0) {
        state.deck = newPile;
      } else if (pileIndex === 1) {
        state.waste = newPile;
      } else if (pileIndex > 1 && pileIndex < 6) {
        Vue.set(state.foundations, pileIndex - 2, newPile);
      } else if (pileIndex >= 6) {
        Vue.set(state.tableau, pileIndex - 6, newPile);
      }
    },
  },
  getters: {
    selectedCard: (state) => state.selectedCard,
    deck: (state) => state.deck,
    waste: (state) => state.waste,
    tableau: (state) => state.tableau,
    foundations: (state) => state.foundations,
    gameState: (state) => state.gameState,
    cursorPosition: (state) => state.cursorPosition,
    cardWidth: (state) => state.cardWidth,
    cardUnderCursor: (state) => {
      let pileIndex = state.cursorPosition[0];
      let positionIndex = state.cursorPosition[1];
      let card = null;
      if (pileIndex === 0) {
        card = last(state.deck);
      } else if (pileIndex === 1) {
        card = last(state.waste);
      } else if (pileIndex > 1 && pileIndex < 6) {
        let pile = state.foundations[pileIndex - 2];
        if (pile) card = pile[positionIndex];
      } else {
        let pile = state.tableau[pileIndex - 6];
        if (pile && positionIndex <= pile.length) card = pile[positionIndex];
      }
      if (card) {
        return clone(card);
      } else {
        return { pileIndex: pileIndex, rank: null, suit: null };
      }
    },
    getCard: (state) => (cardComponent) => {
      const suit = cardComponent.suit;
      const rank = cardComponent.rank;
      let card = null;
      for (let i = 0; i < state.tableau.length; i++) {
        let pile = state.tableau[i];
        card = pile.find(
          (element) => element.rank === rank && element.suit === suit
        );
        if (card) break;
      }
      if (!card) {
        for (let i = 0; i < state.foundations.length; i++) {
          let pile = state.foundations[i];
          card = pile.find(
            (element) => element.rank === rank && element.suit === suit
          );
          if (card) break;
        }
      }
      if (!card) {
        card = state.deck.find(
          (element) => element.rank === rank && element.suit === suit
        );
      }
      if (!card) {
        card = state.waste.find(
          (element) => element.rank === rank && element.suit === suit
        );
      }
      return clone(card);
    },
    pileForCard: (state) => (card) => {
      if (card.pileIndex === 0) {
        return state.deck;
      } else if (card.pileIndex === 1) {
        return state.waste;
      } else if (card.pileIndex > 1 && card.pileIndex < 6) {
        return state.foundations[card.pileIndex - 2];
      } else {
        return state.tableau[card.pileIndex - 6];
      }
    },
  },
  actions: {
    testWin({ commit }) {
      commit("WIN_TEST");
      commit("END_TURN");
    },
    draw({ commit }) {
      commit("DRAW_CARD");
      commit("SET_SELECTED", null);
    },
    undo({ commit }) {
      commit("DRAW_CARD_REVERSE");
      commit("SET_SELECTED", null);
    },
    flipWaste({ commit }) {
      commit("FLIP_WASTE");
      commit("SET_SELECTED", null);
    },
    redeal({ commit }) {
      commit("RESET");
      commit("DEAL");
    },
    selectCard({ commit }, card) {
      commit("SET_SELECTED", card);
    },
    moveCursor({ commit, state, getters }, payload) {
      /*
      x = pileIndex (0-12)
      y = position in pile (0-pile.length)
      
      Piles arrangement on board:
      # 0  1     2  3  4  5  #
      # 6  7  8  9  10 11 12 #

      */
      console.log("run moveCursor");
      const xDelta = payload[0];
      const yDelta = payload[1];
      const pileIndex = state.cursorPosition[0];
      const positionIndex = state.cursorPosition[1];
      let newPileIndex = mod(pileIndex + xDelta, 13); // change pileIndex and wrap at ends
      let newPositionIndex = positionIndex + yDelta; // change position in pile OR if move exceeds pile size, change pile

      // is user moves up or down, change position in pile or change pile itself
      if (yDelta != 0) {
        // if we're moving within a tableau pile
        if (newPileIndex >= 6) {
          let pile = state.tableau[newPileIndex - 6];
          // check for valid new pos - between first faceup card's index and pile.length
          // if move would be onto a facedown card, move to the pile above this one
          const firstFaceupIndex = findIndex(pile, (card) => card.faceup === true);
          if (newPositionIndex < firstFaceupIndex) {
            if (newPileIndex <= 7) { // between 6 and 7
              // move onto first two tableau piles
              newPileIndex -= 6;
            } else if (newPileIndex >= 9) { // 9-12
              // last 4 tableau piles (skip the one with an empty cell above it)
              newPileIndex -= 7;
            } else {
              // clamp the index value to legal positions within pile
              newPositionIndex = Math.max(firstFaceupIndex, Math.min(newPositionIndex, pile.length - 1));
            }
          } else {
            // move within faceup section of pile
            const minPos = Math.max(0, firstFaceupIndex);
            const maxPos = Math.max(0, pile.length - 1);
            newPositionIndex = Math.min(maxPos, Math.max(minPos, newPositionIndex));
          }
        } else if (newPileIndex < 6 && yDelta > 0) {
          // draw and foundation piles are always flat, so user can only move down a pile
          if (newPileIndex > 1) {
            newPileIndex++; // skip empty cell
          }
          const newPile = state.tableau[newPileIndex];
          const firstFaceUp = findIndex(newPile, (card) => card.faceup === true);
          newPositionIndex = Math.max(0, firstFaceUp);
          newPileIndex += 6;
        }
      }

      // if the user changes piles, they should default to the top card
      if (xDelta != 0) {
        const pile = getters.pileForCard({ pileIndex: newPileIndex });
        newPositionIndex = Math.max(0, pile.length - 1);
      }

      const newPos = [newPileIndex, newPositionIndex];
      commit("SET_CURSOR", newPos);
    },
    moveCard({ commit, state, getters }, to) {
      const from = state.selectedCard;
      const fromPile = clone(getters.pileForCard(from));
      const toPile = clone(getters.pileForCard(to));

      // do not allow user to move card to same pile
      if (to.pileIndex === from.pileIndex) {
        commit("SET_SELECTED", null);
        return;
      }

      // if move is invalid, cancel card move
      if (to.pileIndex > 1 && to.pileIndex < 6) {
        if (!isFoundationPositionValid(from, to)) {
          commit("SET_SELECTED", null);
          return;
        }
      } else if (to.pileIndex >= 6) {
        if (!isTableauPositionValid(from, to)) {
          commit("SET_SELECTED", null);
          return;
        }
      }

      // move is valid, so make it
      const card = fromPile.pop();
      card.pileIndex = to.pileIndex;
      toPile.push(card);

      // flip last card on from pile faceup
      const topFrom = last(fromPile);
      if (topFrom) {
        topFrom.faceup = true;
      }

      // update state store
      commit("REPLACE_PILE", {
        pileIndex: from.pileIndex,
        newPile: fromPile,
      });

      commit("REPLACE_PILE", {
        pileIndex: to.pileIndex,
        newPile: toPile,
      });

      // end turn
      commit("SET_SELECTED", null);
      commit("END_TURN");
    },
    moveStack({ commit, state }, to) {
      // selectedCard is not on the top of its pile
      const from = state.selectedCard;

      // can only move stacks from and to the tableau
      if (from.pileIndex < 6 && to.pileIndex < 6) {
        commit("SET_SELECTED", to);
        return;
      }

      // cannot move stack onto itself
      if (from.pileIndex === to.pileIndex) {
        commit("SET_SELECTED", to);
        return;
      }

      // validate position
      if (!isTableauPositionValid(from, to)) {
        commit("SET_SELECTED", to);
        return;
      }

      const fromPile = clone(state.tableau[from.pileIndex - 6]);
      const fromCardIndex = findIndex(fromPile, (card) => {
        return isSameCard(card, state.selectedCard);
      });
      const stack = fromPile.slice(fromCardIndex);

      // move to tableau - move entire stack
      const newToPile = clone(state.tableau[to.pileIndex - 6]).concat(stack);
      const newFromPile = fromPile.slice(0, fromCardIndex);
      if (last(newFromPile)) last(newFromPile).faceup = true;

      // update state store
      commit("REPLACE_PILE", {
        pileIndex: from.pileIndex,
        newPile: newFromPile,
      });

      commit("REPLACE_PILE", {
        pileIndex: to.pileIndex,
        newPile: newToPile,
      });

      // end turn
      commit("SET_SELECTED", null);
      commit("END_TURN");
    },
  },
});
