<template>
  <div id="app">
    <TheHeader />
    <TheEditor />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
#app {
  display: grid;
  grid-template-rows: var(--header-height) 1fr;
  height: 100vh;
}
</style>
