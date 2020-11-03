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
      let src = this.faceup
        ? require(`@/assets/images/${this.rank.charAt(0) +
            this.suit.charAt(0)}.svg`)
        : require(`@/assets/images/BACK2.svg`); //BACK1.PNG, BACK2.SVG, BACK3.PNG
      return {
        backgroundImage: "url(" + src + ")",
      };
    },
  },
  methods: {
    selectCard() {
      if (this.faceup) {
        // can only select faceup card
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
  padding-bottom: calc(0.12 * 100vw * 1.4);
  background-color: white;
  background-size: contain;
  background-repeat: no-repeat;
  border-radius: 10px;
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
    background: rgba(0, 0, 0, 0.1);
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  }
}
</style>
