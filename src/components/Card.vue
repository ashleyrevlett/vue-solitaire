<template>
  <div
    class="card"
    :class="[
      suit,
      faceup ? 'faceup' : 'facedown',
      selected ? 'selected' : '',
      isUnderCursor ? 'highlighted' : '',
      !rank && !suit ? 'empty-pile' : '',
    ]"
    :style="cardStyle"
    ref="card"
    @click="selectCard"
  >
    <div class="card-inner">
      <div
        class="card-front side"
        :style="{ backgroundImage: 'url(' + imageSrc + ')' }"
      ></div>
      <div
        class="card-back side"
        :style="{
          backgroundImage: 'url(' + require('@/assets/images/BACK2.svg') + ')',
        }"
      ></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { isSameCard } from "../utils/utils";

export default {
  name: "Card",
  props: {
    rank: String,
    suit: String,
    faceup: Boolean,
    pileIndex: Number,
  },
  computed: {
    ...mapGetters([
      "selectedCard",
      "cursorPosition",
      "cardUnderCursor",
      "cardWidth",
    ]),
    selected: function () {
      const isSelected = isSameCard(this.selectedCard, this);
      if (this.pileIndex && isSelected) return true; // cursor's card will not have pileindex
      return false;
    },
    isUnderCursor: function () {
      if (!this.rank || !this.suit) {
        // empty card
        if (this.cursorPosition[0] === this.pileIndex) return true;
        else return false;
      } else {
        // normal card
        return isSameCard(this.cardUnderCursor, this);
      }
    },
    imageSrc: function () {
      if (this.rank && this.suit) {
        return require(`@/assets/images/${
          this.rank.charAt(0) + this.suit.charAt(0)
        }.svg`);
      } else {
        // empty pile
        return "";
      }
    },
    cardStyle: function () {
      let style = {
        width: this.cardWidth + "px",
        paddingBottom: this.cardWidth * 1.4 + "px",
      };

      return style;
    },
  },
  methods: {
    selectCard() {
      const card = {
        rank: this.rank,
        suit: this.suit,
        faceup: this.faceup,
        pileIndex: this.pileIndex,
      };
      this.$root.$emit("card-click", card);
    },
  },
};
</script>

<style lang="scss">
.card {
  background-color: transparent;
  perspective: 1000px; /* Remove this if you don't want the 3D effect */
  border-radius: 0.7rem;
  position: relative;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  overflow: hidden;

  &.selected {
    // box-shadow: 0 0 0 3px yellow;
    opacity: 0;
  }

  &.highlighted {
    box-shadow: 0 0 0 3px blue !important;
  }

  &.facedown {
    background-size: cover;

    /* Do an horizontal flip when you move the mouse over the flip box container */
    .card-inner {
      transform: rotateY(180deg);
    }
  }

  &.empty-pile {
    background: rgba(0, 0, 0, 0.1);
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  }

  /* This container is needed to position the front and back side */
  .card-inner {
    position: absolute;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }

  /* Position the front and back side */
  .card-front,
  .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden; /* Safari */
    backface-visibility: hidden;
    background-position: center center;
    background-size: contain;
  }

  /* Style the back side */
  .card-back {
    transform: rotateY(180deg);
  }
}
</style>
