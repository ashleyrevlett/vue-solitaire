<template>
  <div
    class="card"
    :class="[suit, faceup ? 'faceup' : 'facedown', selected ? 'selected' : '']"
    v-on:click="selectCard"
  >
    <div class="face" v-if="faceup">
      <span class="suit">{{ symbol }}</span>
      <span class="rank">{{ rank }}</span>
    </div>
    <div class="back" v-if="!faceup"></div>
  </div>
</template>
<script>
import { Suits } from "../constants/constants.js";

export default {
  name: "Card",
  props: {
    rank: String,
    suit: String,
    faceup: Boolean,
    selected: Boolean,
    location: String,
    pileIndex: Number,
  },
  computed: {
    symbol: function() {
      return Suits[this.suit];
    },
  },
  methods: {
    selectCard() {
      this.$emit("select-card", this); // in case another card has been selected already
    },
  },
};
</script>

<style lang="scss">
.card {
  height: 100px;
  width: 60px;
  background: white;
  color: black;
  border-radius: 6px;
  border: 3px solid black;
  padding: 3px;
  cursor: pointer;

  &.facedown {
    background: blue;
  }

  &.HEARTS,
  &.DIAMONDS {
    color: red;
  }

  &.selected {
    border-color: yellow;
  }
}
</style>
