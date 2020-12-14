<template>
  <div class="game-board">
    <div id="top-row" class="flex justify-between items-start mb-4">
      <section>
        <div class="draw-piles flex mr-auto">
          <Pile key="draw" :cards="deck" :pileIndex="0" />
          <Pile key="waste" :cards="waste" :pileIndex="1" />
        </div>
      </section>

      <section class="foundation-piles flex">
        <Pile
          v-for="(pile, idx) in foundations"
          :key="'foundation-' + idx"
          :cards="pile"
          :fanned="false"
          :pileIndex="idx + 2"
        />
      </section>
    </div>

    <section class="tableau-piles flex justify-between mb-4">
      <Pile
        v-for="(pile, idx) in tableau"
        :key="'tableau-' + idx"
        :cards="pile"
        :fanned="true"
        :pileIndex="idx + 6"
      />
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Pile from "./Pile.vue";

export default {
  name: "GameBoard",
  components: {
    Pile,
  },
  computed: {
    ...mapGetters(["deck", "waste", "foundations", "tableau"]),
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

.game-board {
  padding: 0 3vw;
  min-height: 100vh;
}
</style>
