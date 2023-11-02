<template>
  <MContainer>
    <MColumn
      v-for="(i, index) in items"
      :key="index"
      :style="{ paddingRight: items.length === index + 1 ? '0' : '10px' }"
    >
      <MLink
        :href="i.link"
        :style="{
          color: i.color,
          fontSize: `${i.fontSize}px`,
        }"
      >
        {{ i.text }}
      </MLink>
    </MColumn>
  </MContainer>
</template>

<script setup lang="ts">
import { MColumn, MContainer, MLink } from '@mysigmail/vue-email-components'
import type { Menu } from '@/types/email-components/menu'

interface Props {
  items: Menu[]
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
</style>
