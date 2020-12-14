<template>
  <div class="game">
    <win-screen v-if="gameState == 'WIN'" />

    <game-cursor></game-cursor>

    <div class="tools w-full mb-4">
      <button @click="redeal">New Game</button>
      <button @click="undo">Undo</button>
      <button @click="testWin">Test Win</button>
    </div>

    <game-board></game-board>
  </div>
</template>

<script>
// import { findIndex, clone, last } from "lodash";
import { mapGetters, mapActions } from "vuex";
import WinScreen from "./WinScreen.vue";
import GameCursor from "./GameCursor.vue";
import GameBoard from "./GameBoard.vue";
import { isSameCard } from "../utils/utils";
import { GameStates } from "../constants/constants.js";

export default {
  name: "Game",
  components: {
    WinScreen,
    GameCursor,
    GameBoard,
  },
  computed: {
    ...mapGetters([
      "deck",
      "waste",
      "tableau",
      "foundations",
      "selectedCard",
      "gameState",
      "cursorPosition",
      "cardUnderCursor",
      "pileForCard",
    ]),
  },

  methods: {
    ...mapActions([
      "redeal",
      "undo",
      "testWin",
      "flipWaste",
      "selectCard",
      "draw",
      "moveCard",
    ]),
    handleCardClick: function(card) {
      /*
      Called when 'card-clicked' event is fired by any card or empty cell
      */
      if (this.gameState !== GameStates.PLAY) return;

      // double-select to deselect card
      if (isSameCard(this.selectedCard, card)) {
        this.selectCard(null);
        return;
      }

      // clicked deck - draw or flip deck
      if (card.pileIndex == 0) {
        if (this.deck.length > 0) this.draw();
        else this.flipWaste();
        return;
      } else {
        // can't select facedown non-empty cards except in deck
        if (!card.faceup && card.suit) return;
      }

      // no card held yet
      if (!this.selectedCard) {
        // empty pile; ignore click
        if (card.suit == null) {
          return;
        } else {
          // pick up card
          this.selectCard(card);
          return;
        }
      }

      // card already held and we just selected where to play it
      // play to waste pile
      if (card.pileIndex === 1) {
        // do not select empty waste
        if (card.suit) this.selectCard(card);
      } else {
        // try to move to tableau and foundation
        this.moveCard(card);
      }
    },
  },
  created: function() {
    this.redeal();
  },
  mounted: function() {
    this.$root.$on("card-click", this.handleCardClick);
  },
};
</script>

<style lang="scss">
button {
  border: 1px solid white;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  margin: 1rem 0.5rem 1rem 0;
  font-size: 0.9rem;
}
</style>
