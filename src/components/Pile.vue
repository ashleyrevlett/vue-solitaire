<template>
  <div
    class="pile"
    :fanned="fanned"
    :class="[fanned ? 'fanned-down' : 'stacked']"
    :style="{ padding: padding / 2 + 'px' }"
  >
    <Card
      v-for="d in displayCards"
      :key="d.rank + '-' + d.suit"
      ref="displayCards"
      :faceup="d.faceup"
      :suit="d.suit"
      :rank="d.rank"
      :pileIndex="pileIndex"
    />
    <Card
      v-if="!displayCards || displayCards.length === 0"
      :key="'empty-' + pileIndex"
      ref="empty"
      :faceup="false"
      :pileIndex="pileIndex"
    />
  </div>
</template>
<script>
import { last } from "lodash";
import Card from "./Card.vue";

export default {
  name: "Pile",
  components: {
    Card,
  },
  props: {
    cards: Array,
    fanned: Boolean,
    pileIndex: Number,
  },
  computed: {
    displayCards: function () {
      if (this.fanned) {
        return this.cards;
      } else if (last(this.cards)) {
        return [last(this.cards)];
      } else {
        return null;
      }
    },
    padding: function () {
      return (window.innerWidth * 0.08) / 7;
    },
  },
};
</script>

<style lang="scss">
.pile {
  width: 100%;

  &.fanned-down {
    .card:not(:first-child) {
      margin-top: -105%;
    }
    .card.facedown:not(:first-child),
    .card.facedown + .card.faceup {
      margin-top: -135%;
    }
  }
}
</style>
