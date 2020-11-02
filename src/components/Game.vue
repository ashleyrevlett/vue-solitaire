<template>
  <div class="game">
    <button @click="redeal">New Game</button>
    <div class="flex">
      <Stock />

      <div class="foundation-piles flex">
        <Pile
          v-for="(pile, idx) in foundations"
          :key="'foundation-' + idx"
          :cards="pile"
          :pileIndex="idx"
          location="FOUNDATION"
        />
      </div>
    </div>

    <div class="tableau-piles flex">
      <Pile
        v-for="(pile, idx) in tableau"
        :key="'tableau-' + idx"
        :cards="pile"
        :fanned="true"
        :pileIndex="idx"
        location="TABLEAU"
      />
    </div>
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
    ...mapActions(["redeal"]),
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
}

.game {
  background: #477148;
  color: white;
  padding: 100px;
  min-height: 100vh;
}
</style>
