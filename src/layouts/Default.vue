<template>
  <div class="default">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.default {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100vh;
}
</style>
