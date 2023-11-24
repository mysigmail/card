<template>
  <MRow
    class="menu-items"
    width="auto"
  >
    <MColumn>
      <MRow>
        <MColumn
          v-for="(i, index) in items"
          :key="index"
          class="link"
          :style="{ paddingRight: items.length === index + 1 ? '0' : '18px' }"
        >
          <MLink :href="i.link">
            <MImg
              :src="i.image.src"
              :style="{
                width: `${i.image.width}px`,
                height: `${i.image.height}px`,
              }"
              :alt="i.image.alt"
            />
          </MLink>
        </MColumn>
      </MRow>
    </MColumn>
  </MRow>
</template>

<script setup lang="ts">
import { MColumn, MImg, MLink, MRow } from '@mysigmail/vue-email-components'
import type { MenuItemImg } from '@/types/email-components/menu'

interface Props {
  items: MenuItemImg[]
}

defineProps<Props>()
</script>

<style lang="scss" scoped></style>
