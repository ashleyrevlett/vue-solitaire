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
    @click="selectCard"
  ></div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Card",
  props: {
    rank: String,
    suit: String,
    faceup: Boolean,
    pileIndex: Number,
  },
  computed: {
    ...mapGetters(["selectedCard", "cursorPosition", "cardUnderCursor"]),

    selected: function() {
      return (
        this.selectedCard &&
        this.selectedCard.rank == this.rank &&
        this.selectedCard.suit == this.suit
      );
    },
    isUnderCursor: function() {
      if (!this.rank || !this.suit) {
        // empty card
        if (this.cursorPosition[0] === this.pileIndex) return true;
        else return false;
      } else {
        // normal card
        if (
          this.cardUnderCursor &&
          this.cardUnderCursor.rank == this.rank &&
          this.cardUnderCursor.suit == this.suit
        ) {
          return true;
        }
        return false;
      }
    },
    cardStyle: function() {
      if (!this.suit) return null;

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

  &.highlighted {
    box-shadow: 0 0 0 3px blue !important;
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
