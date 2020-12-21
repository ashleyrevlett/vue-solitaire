<template>
  <div class="game-cursor" :style="cursorStyle">
    <img class="icon-hand" src="@/assets/images/cursor_hand.svg" alt="" />
    <div v-if="selectedCard" class="ghost-card">
      <Card
        :rank="selectedCard.rank"
        :suit="selectedCard.suit"
        :faceup="true"
      />
    </div>
  </div>
</template>

<script>
import { last, findIndex } from "lodash";
import { isSameCard } from "../utils/utils";
import { GameStates, Layout } from "../constants/constants";
import { mapGetters } from "vuex";
import Card from "./Card.vue";

export default {
  name: "GameCursor",
  components: {
    Card,
  },
  computed: {
    ...mapGetters([
      "selectedCard",
      "cardUnderCursor",
      "cardWidth",
      "gameState",
      "cursorPosition",
      "pileForCard",
    ]),
    cardHeight: function () {
      return this.cardWidth * 1.4;
    },
    cursorWidth: function () {
      return this.cardWidth;
    },
    cursorStyle: function () {
      const pileIndex = this.cardUnderCursor.pileIndex;
      const pileWidth =
        this.cardWidth + (window.innerWidth * Layout.padding) / 7;

      // position cursor over horizontal center of correct pile
      let xPos = 0;
      if (pileIndex < 7) {
        xPos =
          (pileIndex % 6) * pileWidth + pileWidth / 2 - this.cursorWidth / 2;
      } else {
        xPos =
          ((pileIndex - 6) % 7) * pileWidth +
          pileWidth / 2 -
          this.cursorWidth / 2;
      }

      // account for empty cell in top row
      if (pileIndex > 1 && pileIndex < 6) {
        xPos += pileWidth;
      }

      // position cursor in  vertical center of visible portion of card
      let yPos = this.cardHeight * 0.25;
      if (pileIndex >= 6) {
        yPos += this.cardHeight; // 2nd row

        const faceUpOffset = 0.26 * this.cardHeight;
        const faceDownOffset = 0.0358 * this.cardHeight;
        const pile = this.pileForCard(this.cardUnderCursor);
        const cardIndex = this.cursorPosition[1];
        const firstFaceupIndex = findIndex(pile, function (card) {
          return card.faceup === true;
        });
        for (let i = 0; i < firstFaceupIndex; i++) {
          yPos += faceDownOffset;
        }
        for (let j = firstFaceupIndex; j < cardIndex; j++) {
          yPos += faceUpOffset;
        }
        // if not on top of pile then move cursor up a bit
        if (cardIndex != pile.length) {
          yPos -= 10;
        }
      }

      return {
        left: xPos + "px",
        top: yPos + "px",
        width: this.cursorWidth + "px",
      };
    },
  },
  methods: {
    keyPress(event) {
      if (this.gameState !== GameStates.PLAY) return;

      switch (event.keyCode) {
        case 13: // ENTER
          this.$root.$emit("card-click", this.cardUnderCursor);
          break;
        case 38: // UP
          this.$store.dispatch("moveCursor", [0, -1]);
          break;
        case 37: // LEFT
          this.$store.dispatch("moveCursor", [-1, 0]);
          break;
        case 39: // RIGHT
          this.$store.dispatch("moveCursor", [1, 0]);
          break;
        case 40: // DOWN
          this.$store.dispatch("moveCursor", [0, 1]);
          break;
      }
    },
  },
  created() {
    document.addEventListener("keydown", this.keyPress);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.keyPress);
  },
};
</script>

<style lang="scss">
.game-cursor {
  position: absolute;
  transition: 0.2s all;
  z-index: 1;

  .icon-hand {
    width: 20%;
    position: absolute;
    left: 40%;
    top: 10%;
    z-index: 3;
  }

  .ghost-card {
    transform: scale(1.005, 1.0005);
    box-shadow: 0.5rem 0.5rem 0.5rem rgba(0, 0, 0, 0.6);
  }
}
</style>
