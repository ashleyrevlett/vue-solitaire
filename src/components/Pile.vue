<template>
  <div
    class="pile"
    :fanned="fanned"
    :class="[fanned ? 'fanned-down' : 'stacked']"
  >
    <Card
      v-for="d in cards"
      :key="d.rank + '-' + d.suit"
      :faceup="d.faceup"
      :suit="d.suit"
      :rank="d.rank"
      :location="d.location"
      :pileIndex="d.pileIndex"
    />
    <div
      v-if="!cards || cards.length === 0"
      class="card empty-pile"
      @click="selectEmpty"
    ></div>
  </div>
</template>
<script>
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
  methods: {
    selectEmpty() {
      let card = {
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
  margin: 5px;

  &.fanned-down {
    .card:not(:first-child) {
      margin-top: -70px;
    }
    .card.facedown:not(:first-child) {
      margin-top: -90px;
    }
    .card.facedown + .card.faceup {
      margin-top: -90px;
    }
  }

  .empty-pile {
    border: 2px dashed black;
  }

  &.stacked {
    position: relative;
    width: 60px;

    .card {
      position: absolute;
    }
  }
}
</style>
