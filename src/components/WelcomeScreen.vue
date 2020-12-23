<template>
  <div class="welcomeScreen">
    <div class="panel">
      <h1>Welcome to Solitaire!</h1>
      <button @click="redeal">New Game</button>
      <p>
        Games Won: XX<br />
        High Score: X:XX
      </p>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "WelcomeScreen",
  methods: {
    ...mapActions(["redeal"]),
  },
};
</script>

<style lang="scss">
.welcomeScreen {
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
