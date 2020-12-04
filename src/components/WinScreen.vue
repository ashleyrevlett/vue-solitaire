<template>
  <div class="winScreen">
    <div class="panel">
      <h1>
        Congratulations!<br />
        You Win!
      </h1>
      <button @click="redeal">Play Again</button>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "WinSCreen",
  methods: {
    ...mapActions(["redeal"]),
  },
};
</script>

<style lang="scss">
.winScreen {
  position: absolute;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  .panel {
    background: white;
    color: black;
    border-radius: 1.5rem;
    border: 2px solid black;
    padding: 3rem;
    text-align: center;
  }

  h1 {
    font-size: 2rem;
  }
}
</style>
