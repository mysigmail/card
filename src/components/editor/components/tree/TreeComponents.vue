<script setup lang="ts">
import { useComponentsStore } from '@/store/components'

const { installedToolsByGroup, installed } = useComponentsStore()
</script>

<template>
  <div>
    <TreeComponentsItem
      v-for="(i, index) in installedToolsByGroup"
      :id="i.id"
      :key="i.id"
      :index="index"
      :name="i.name"
      :groups="i.groups"
    />
    <div
      v-if="!installed.length"
      class="p-4 text-muted-foreground"
    >
      The component tree is empty
    </div>
  </div>
</template>
