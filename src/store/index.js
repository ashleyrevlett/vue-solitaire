import Vue from "vue";
import Vuex from "vuex";
import { last, findIndex, shuffle } from "lodash";

import {
  isFoundationPositionValid,
  isTableauPositionValid,
} from "../utils/utils.js";
import { Suits, Ranks } from "../constants/constants.js";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    selectedCard: null,
    deck: [],
    waste: [],
    foundations: [[], [], [], []],
    tableau: [[], [], [], [], [], [], []],
  },
  mutations: {
    SET_SELECTED(state, card) {
      state.selectedCard = state.selectedCard == card ? null : card;
    },
    MOVE_FOUNDATION_TO_TABLEAU(state, { from, to }) {
      const top = state.foundations[from.pileIndex].pop();
      top.location = to.location;
      top.pileIndex = to.pileIndex;
      const newColumn = state.tableau[to.pileIndex].slice(0);
      newColumn.push(top);
      Vue.set(state.tableau, to.pileIndex, newColumn);
    },
    MOVE_WASTE_TO_TABLEAU(state, { location, pileIndex }) {
      const top = state.waste.pop();
      if (!top) return;
      top.location = location;
      top.pileIndex = pileIndex;
      if (location === "TABLEAU") {
        const newColumn = state.tableau[pileIndex].slice(0);
        newColumn.push(top);
        Vue.set(state.tableau, pileIndex, newColumn);
      } else if (location === "FOUNDATION") {
        const newColumn = state.foundations[pileIndex].slice(0);
        newColumn.push(top);
        Vue.set(state.foundations, pileIndex, newColumn);
      }
    },
    MOVE_TABLEAU_STACK(state, { from, to }) {
      // move 1 or more cards from one tableau pile to another
      let fromPile = state.tableau[from.pileIndex];
      let toPile = state.tableau[to.pileIndex];
      const fromIndex = findIndex(
        fromPile,
        (card) => card.suit === from.suit && card.rank === from.rank
      );
      const stack = fromPile.slice(fromIndex);
      stack.forEach((card) => {
        card.pileIndex = to.pileIndex;
      });
      toPile = toPile.concat(stack);
      fromPile = fromPile.slice(0, fromIndex);
      if (last(fromPile)) last(fromPile).faceup = true;
      Vue.set(state.tableau, from.pileIndex, fromPile);
      Vue.set(state.tableau, to.pileIndex, toPile);
    },
    MOVE_TABLEAU_TO_FOUNDATION(state, { from, to }) {
      // assume we get only the top card from a tableau stack
      const fromPile = state.tableau[from.pileIndex];
      const top = fromPile.pop();
      top.pileIndex = to.pileIndex;
      top.location = "FOUNDATION";
      const stack = state.foundations[to.pileIndex].slice(0);
      stack.push(top);
      Vue.set(state.foundations, to.pileIndex, stack);
      if (last(state.tableau[from.pileIndex]))
        last(state.tableau[from.pileIndex]).faceup = true;
    },
    DRAW_CARD(state) {
      // turn card from deck to waste
      const top = state.deck.pop();
      if (top) {
        top.location = "WASTE";
        top.faceup = true;
        state.waste.push(top);
      }
    },
    DRAW_CARD_REVERSE(state) {
      // turn card from waste to deck
      const top = state.waste.pop();
      if (top) {
        top.location = "DECK";
        top.faceup = false;
        state.deck.push(top);
      }
    },
    FLIP_WASTE(state) {
      // flip over waste stack to draw stack
      if (state.deck.length === 0 && state.waste.length === 0) return;
      state.waste.forEach((card) => {
        card.location = "DECK";
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
          card.location = "TABLEAU";
          card.pileIndex = i;
          state.tableau[i].push(card);
        }
      }
    },
    RESET(state) {
      // restart game and build deck
      state.selectedCard = null;
      state.foundations = [[], [], [], []];
      state.tableau = [[], [], [], [], [], [], []];
      state.waste = [];
      state.deck = [];
      Object.keys(Suits).forEach((suit) => {
        Ranks.forEach((rank) => {
          const card = {
            rank,
            suit,
            faceup: true,
            location: "DECK",
          };
          state.deck.push(card);
        });
      });
      state.deck = shuffle(state.deck);
    },
  },
  getters: {
    selectedCard: (state) => state.selectedCard,
    deck: (state) => state.deck,
    waste: (state) => state.waste,
    topWaste: (state) => last(state.waste),
    tableau: (state) => state.tableau,
    foundations: (state) => state.foundations,
  },
  actions: {
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
    playCard({ commit, state }, payload) {
      // place card on tableau or foundation
      const from = payload.oldCard;
      const to = payload.newCard;

      // return early if move to foundation is invalid
      if (to.location === "FOUNDATION") {
        const fromPile =
          from.location == "TABLEAU" ? state.tableau[from.pileIndex] : null;
        if (!isFoundationPositionValid(from, to, fromPile)) return;
      }

      // return early if move to tableau is invalid
      if (to.location === "TABLEAU" && !isTableauPositionValid(from, to))
        return;

      // otherwise, make the move
      switch (from.location) {
        case "WASTE":
          commit("MOVE_WASTE_TO_TABLEAU", {
            location: to.location,
            pileIndex: to.pileIndex,
          });
          break;
        case "TABLEAU":
          if (to.location === "TABLEAU") {
            commit("MOVE_TABLEAU_STACK", {
              from: from,
              to: to,
            });
          } else if (to.location === "FOUNDATION") {
            commit("MOVE_TABLEAU_TO_FOUNDATION", {
              from: from,
              to: to,
            });
          }
          break;
        case "FOUNDATION":
          if (to.location == "TABLEAU") {
            commit("MOVE_FOUNDATION_TO_TABLEAU", {
              from: from,
              to: to,
            });
          }
          break;
      }
      // reset selected card
      commit("SET_SELECTED", null);
    },
  },
});
