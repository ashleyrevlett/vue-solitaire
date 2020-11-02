<template>
  <div
    class="pile mr-4"
    :fanned="fanned"
    :class="[fanned ? 'fanned-down' : 'stacked']"
  >
    <Card
      v-for="d in displayCards"
      :key="d.rank + '-' + d.suit"
      :faceup="d.faceup"
      :suit="d.suit"
      :rank="d.rank"
      :location="d.location"
      :pileIndex="d.pileIndex"
    />
    <div
      v-if="!displayCards || displayCards.length === 0"
      class="card empty-pile"
      @click="selectEmpty"
    ></div>
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
    location: String,
  },
  computed: {
    displayCards: function() {
      if (this.fanned) {
        return this.cards;
      } else if (last(this.cards)) {
        return [last(this.cards)];
      } else {
        return null;
      }
    },
  },
  methods: {
    selectEmpty() {
      if (!this.$store.getters.selectedCard) return;

      const card = {
        pileIndex: this.pileIndex,
        location: this.location,
      };
      this.$store.dispatch("playCard", {
        oldCard: this.$store.getters.selectedCard,
        newCard: card,
      });
    },
  },
};
</script>

<style lang="scss">
.pile {
  &.fanned-down {
    .card:not(:first-child) {
      margin-top: calc(0.12 * 100vw * -1.05);
    }
    .card.facedown:not(:first-child) {
      margin-top: calc(0.12 * 100vw * -1.3);
    }
    .card.facedown + .card.faceup {
      margin-top: calc(0.12 * 100vw * -1.3);
    }
  }

  // &.stacked {
  //   position: relative;
  //   width: 60px;

  //   .card {
  //     position: absolute;
  //   }
  // }
}
</style>
