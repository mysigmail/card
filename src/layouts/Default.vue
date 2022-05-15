<template>
  <div class="default">
    <TheHeader />
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.default {
  display: grid;
  grid-template-rows: var(--header-height) 1fr;
  height: 100vh;
}
</style>
