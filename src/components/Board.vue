<template>
  <div class="board">
    <div id="top-row" class="flex">
      <section :style="{ marginRight: marginRight + 'px' }">
        <div class="draw-piles flex">
          <Pile ref="draw" key="draw" :cards="deck" :pileIndex="0" />
          <Pile ref="waste" key="waste" :cards="waste" :pileIndex="1" />
        </div>
      </section>

      <section class="foundation-piles flex">
        <Pile
          v-for="(pile, idx) in foundations"
          :key="'foundation-' + idx"
          :ref="'foundation-' + idx"
          :cards="pile"
          :fanned="false"
          :pileIndex="idx + 2"
        />
      </section>
    </div>

    <section class="tableau-piles flex">
      <Pile
        v-for="(pile, idx) in tableau"
        :key="'tableau-' + idx"
        :ref="'tableau-' + idx"
        :cards="pile"
        :fanned="true"
        :pileIndex="idx + 6"
      />
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { Layout } from "../constants/constants.js";
import Pile from "./Pile.vue";

export default {
  name: "Board",
  components: {
    Pile,
  },
  computed: {
    ...mapGetters(["deck", "waste", "foundations", "tableau", "cardWidth"]),
    marginRight: function () {
      const padding = (window.innerWidth * Layout.padding) / 7;
      return padding + this.cardWidth;
    },
  },
};
</script>

<style lang="scss">
body {
  padding: 0;
  margin: 0;
}

.board {
  height: 100vh;
  width: 100vw;
  background: #477148;
  color: white;
  overflow: hidden;
}
</style>
