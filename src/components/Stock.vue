<template>
  <section>
    <button @click="undo">Undo</button>
    <div class="draw-piles flex mr-auto">
      <div class="draw-pile pile">
        <div
          v-if="deck.length == 0"
          class="card empty-pile"
          @click="flipWaste"
        ></div>
        <div v-else class="card facedown" v-on:click="draw"></div>
      </div>

      <div class="waste pile">
        <Card
          v-if="topWaste"
          :key="topWaste.rank + '-' + topWaste.suit"
          :rank="topWaste.rank"
          :suit="topWaste.suit"
          :faceup="topWaste.faceup"
          :location="topWaste.location"
        />
        <div v-else class="card empty-pile"></div>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Card from "./Card.vue";

export default {
  name: "Stock",
  components: {
    Card,
  },
  props: {},
  computed: {
    ...mapGetters(["deck", "waste", "topWaste", "selectedCard"]),
  },
  methods: {
    ...mapActions(["draw", "undo", "flipWaste"]),
  },
};
</script>

<style lang="scss"></style>
