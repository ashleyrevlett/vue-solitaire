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
      :location="location"
      :pileIndex="pileIndex"
      :selected="
        selectedCard &&
          d.rank === selectedCard.rank &&
          d.suit === selectedCard.suit
      "
      v-on="$listeners"
    />
    <div
      v-if="cards.length === 0"
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
    selectedCard: Object,
    location: String,
    pileIndex: Number,
  },
  methods: {
    selectEmpty() {
      let card = {
        pileIndex: this.pileIndex,
        location: this.location,
      };
      this.$emit("select-empty", card);
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
