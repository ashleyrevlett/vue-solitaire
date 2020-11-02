<template>
  <div
    class="card"
    :class="[suit, faceup ? 'faceup' : 'facedown', selected ? 'selected' : '']"
    :style="cardStyle"
    @click="selectCard"
  ></div>
</template>
<script>
import { Suits } from "../constants/constants.js";

export default {
  name: "Card",
  props: {
    rank: String,
    suit: String,
    faceup: Boolean,
    location: String,
    pileIndex: Number,
  },
  computed: {
    symbol: function() {
      return Suits[this.suit];
    },
    selected: function() {
      return (
        this.$store.getters.selectedCard &&
        this.$store.getters.selectedCard.rank == this.rank &&
        this.$store.getters.selectedCard.suit == this.suit
      );
    },
    displayName: function() {
      return `${this.rank} of ${this.suit} (location: ${this.location}, index ${this.pileIndex})`;
    },
    cardStyle: function() {
      let src = require(`@/assets/images/BACK.png`);
      if (this.faceup) {
        src = require(`@/assets/images/${this.rank}_${this.suit}.png`);
      }
      return {
        backgroundImage: "url(" + src + ")",
      };
    },
  },
  methods: {
    selectCard() {
      if (this.faceup) {
        // can only select faceup card
        console.log("card clicked:", this);
        this.$store.commit("SET_SELECTED", this);
      } else {
        // facedown draw pile click event
        this.$emit("clicked");
      }
    },
  },
};
</script>

<style lang="scss">
.card {
  width: calc(0.12 * 100vw);
  padding-bottom: calc(0.12 * 100vw * 1.45);
  background-color: white;
  background-size: contain;
  background-repeat: no-repeat;
  border-radius: 6px;
  position: relative;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.3);
  cursor: pointer;

  &.selected {
    box-shadow: 0 0 0 3px yellow;
  }

  &.facedown {
    background-size: cover;
  }

  &.empty-pile {
    background: none;
    border: 2px dashed black;
    box-shadow: none;
  }
}
</style>
