<template>
  <MRow
    class="menu-items"
    width="auto"
  >
    <MColumn align="center">
      <MRow>
        <MColumn
          v-for="(i, index) in items"
          :key="index"
          class="link"
          :style="{ paddingRight: items.length === index + 1 ? '0' : '10px' }"
        >
          <MLink
            :href="i.link"
            :style="{
              color: i.color,
              fontSize: `${i.fontSize}px`,
            }"
          >
            <template v-if="!$slots.item">
              {{ i.text }}
            </template>
            <slot
              name="item"
              :item="i"
            />
          </MLink>
        </MColumn>
      </MRow>
    </MColumn>
  </MRow>
</template>

<script setup lang="ts">
import { MColumn, MLink, MRow } from '@mysigmail/vue-email-components'
import type { MenuItemText } from '@/types/email-components/menu'

interface Props {
  items: MenuItemText[]
}

defineProps<Props>()
</script>

<style lang="scss" scoped></style>
