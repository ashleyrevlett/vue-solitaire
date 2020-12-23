<template>
  <div class="game">
    <win-screen v-if="gameState == 'WIN'" />

    <game-cursor></game-cursor>

    <div class="toolbar w-full mb-4">
      <button @click="redeal">New Game</button>
      <button @click="undo">Undo</button>
      <button @click="testWin">Test Win</button>
    </div>

    <div class="board">
      <section id="top-row" class="flex">
        <Pile ref="pile0" key="pile-0" :cards="deck" :pileIndex="0" />
        <Pile ref="pile1" key="pile-1" :cards="waste" :pileIndex="1" />
        <div class="pile"><!-- fake pile --></div>
        <Pile
          v-for="(pile, idx) in foundations"
          :key="'pile-' + (idx + 2)"
          :ref="'pile' + (idx + 2)"
          :cards="pile"
          :fanned="false"
          :pileIndex="idx + 2"
        />
      </section>
      <section class="tableau-piles flex">
        <Pile
          v-for="(pile, idx) in tableau"
          :key="'pile-' + (idx + 6)"
          :ref="'pile' + (idx + 6)"
          :cards="pile"
          :fanned="true"
          :pileIndex="idx + 6"
        />
      </section>
    </div>
  </div>
</template>

<script>
import { findIndex } from "lodash";
import { mapGetters, mapActions } from "vuex";
import WinScreen from "./WinScreen.vue";
import GameCursor from "./GameCursor.vue";
import Pile from "./Pile.vue";
import { isSameCard } from "../utils/utils";
import { GameStates, Layout } from "../constants/constants.js";

export default {
  name: "GameController",
  components: {
    WinScreen,
    GameCursor,
    Pile,
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
      "moveStack",
    ]),
    handleCardClick: function (card) {
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
        // attempt move to tableau and foundation...
        // move single card or stack?
        const fromPile = this.pileForCard(this.selectedCard);
        const fromCardIndex = findIndex(fromPile, (card) => {
          return isSameCard(card, this.selectedCard);
        });
        if (fromPile.length === fromCardIndex + 1) {
          this.moveCard(card);
        } else {
          this.moveStack(card);
        }
      }
    },
  },
  created: function () {
    this.redeal();
  },
  mounted: function () {
    this.$root.$on("card-click", this.handleCardClick);
  },
  destroyed: function () {},
};
</script>

<style lang="scss">
body {
  padding: 0;
  margin: 0;
}

.board {
  height: 100vh;
  width: 100vw;
  background: #477148;
  color: white;
  overflow: hidden;
}

.toolbar {
  position: absolute;
  bottom: 0;
}

button {
  border: 1px solid white;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  margin: 1rem 0.5rem 1rem 0;
  font-size: 0.9rem;
}
</style>
