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
  ></div>
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
  data() {
    return {
      x: 0,
      y: 0,
      width: 0,
    };
  },
  watch: {
    // pileIndex: function () {
    //   this.updatePosition();
    // },
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
    cardStyle: function () {
      let style = {
        width: this.cardWidth + "px",
        backgroundImage: "",
        paddingBottom: this.cardWidth * 1.4 + "px",
      };

      if (this.suit && this.rank) {
        let src = this.faceup
          ? require(`@/assets/images/${
              this.rank.charAt(0) + this.suit.charAt(0)
            }.svg`)
          : require(`@/assets/images/BACK2.svg`); //BACK1.PNG, BACK2.SVG, BACK3.PNG
        style.backgroundImage = "url(" + src + ")";
      }

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
  background-color: white;
  background-size: contain;
  background-repeat: no-repeat;
  border-radius: 10px;
  position: relative;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.3);
  cursor: pointer;

  &.selected {
    // box-shadow: 0 0 0 3px yellow;
    opacity: 0;
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
