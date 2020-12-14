<template>
  <div class="cursor"></div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "GameCursor",
  computed: {
    ...mapGetters(["cardUnderCursor"]),
  },
  methods: {
    keyPress(event) {
      switch (event.keyCode) {
        case 13: // ENTER
          this.$root.$emit("card-click", this.cardUnderCursor);
          break;
        case 38: // UP
          this.$store.dispatch("moveCursor", [0, -1]);
          break;
        case 37: // LEFT
          this.$store.dispatch("moveCursor", [-1, 0]);
          break;
        case 39: // RIGHT
          this.$store.dispatch("moveCursor", [1, 0]);
          break;
        case 40: // DOWN
          this.$store.dispatch("moveCursor", [0, 1]);
          break;
      }
    },
  },
  created() {
    document.addEventListener("keydown", this.keyPress);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.keyPress);
  },
};
</script>

<style lang="scss"></style>
