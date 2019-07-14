<template>
  <div id="app">
    <Player videoId="abcdursu" aspectRatio="16:9" />
  </div>
</template>

<script>
import Player from "./components/player.vue";

export default {
  name: "app",
  components: {
    Player
  }
};
</script>

<style lang="scss">
@import "./assets/scss/player";
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
