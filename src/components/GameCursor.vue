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
import { GameStates } from "../constants/constants";
import { mapGetters } from "vuex";
import Card from "./Card.vue";

export default {
  name: "GameCursor",
  components: {
    Card,
  },
  data: function () {
    return {
      isMounted: false,
    };
  },
  computed: {
    ...mapGetters([
      "selectedCard",
      "cardUnderCursor",
      "gameState",
      "cursorPosition",
      "pileForCard",
    ]),
    elementUnderCursor: function () {
      if (!this.isMounted || !this.cardUnderCursor || !this.$parent.$refs)
        return null;

      const pileName = "pile" + this.cardUnderCursor.pileIndex;
      let pile = this.$parent.$refs[pileName];
      if (!pile) return;

      if (this.cardUnderCursor.pileIndex > 1) {
        pile = pile[0]; // because these piles are generated using v-for, their refs are created as one-item arrays
      }

      let card = null;
      if (pile.$refs.displayCards) {
        const cards = pile.$refs.displayCards;
        const selectedCardIndex = findIndex(cards, (card) => {
          return isSameCard(card, this.cardUnderCursor);
        });
        if (selectedCardIndex < 0) return;

        card = cards[selectedCardIndex].$refs.card;
      } else {
        card = pile.$refs.empty.$refs.card;
      }

      return card.getBoundingClientRect();
    },
    cursorStyle: function () {
      // position at same spot as card under cursor
      if (!this.isMounted || !this.elementUnderCursor) return;

      const xPos = this.elementUnderCursor.x;
      const yPos =
        this.elementUnderCursor.y + this.elementUnderCursor.height * 0.17;
      return {
        left: xPos + "px",
        top: yPos + "px",
        width: this.elementUnderCursor.width + "px",
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
  mounted() {
    // we use refs in a computed property, so we need to know if they've been mounted yet
    this.isMounted = true;
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
