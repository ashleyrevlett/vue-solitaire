<template>
  <div class="game">
    <div class="tools w-full mb-4">
      <button @click="redeal">New Game</button>
      <button @click="undo">Undo</button>
    </div>

    <div class="flex justify-between items-start mb-4">
      <Stock />
      <section class="foundation-piles flex">
        <Pile
          v-for="(pile, idx) in foundations"
          :key="'foundation-' + idx"
          :cards="pile"
          :pileIndex="idx"
          location="FOUNDATION"
        />
      </section>
    </div>

    <section class="tableau-piles flex justify-between mb-4">
      <Pile
        v-for="(pile, idx) in tableau"
        :key="'tableau-' + idx"
        :cards="pile"
        :fanned="true"
        :pileIndex="idx"
        location="TABLEAU"
      />
    </section>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Pile from "./Pile.vue";
import Stock from "./Stock.vue";

export default {
  name: "Game",
  components: {
    Stock,
    Pile,
  },
  computed: {
    ...mapGetters(["deck", "tableau", "foundations", "selectedCard"]),
  },
  watch: {
    selectedCard: function(newCard, oldCard) {
      /*
      Watch for player to select a 2nd card
      then play the previously selected card to that position
      */
      if (!oldCard || !newCard) return;

      this.$store.dispatch("playCard", { oldCard, newCard });
    },
  },
  methods: {
    ...mapActions(["redeal", "undo"]),
  },
  created: function() {
    this.redeal();
  },
};
</script>

<style lang="scss">
body {
  padding: 0;
  margin: 0;
  background: #477148;
  color: white;
}

.game {
  padding: 0 3vw;
  min-height: 100vh;
}
</style>
