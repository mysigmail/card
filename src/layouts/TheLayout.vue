<template>
  <Component
    :is="components[route.meta.layout]"
    v-show="appStore.isInit"
  >
    <slot />
  </Component>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import Default from './Default.vue'
import Blank from './Blank.vue'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const route = useRoute()

const components: Record<string, any> = {
  Blank,
  Default
}
</script>

<style lang="scss" scoped></style>
