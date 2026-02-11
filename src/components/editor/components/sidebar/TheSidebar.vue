<script setup lang="ts">
import { ref } from 'vue'
import UilListUiAlt from '~icons/uil/list-ui-alt'
import UilServer from '~icons/uil/server'

const activeTab = ref<'components' | 'tree'>('components')
</script>

<template>
  <div class="flex flex-col border-r border-border">
    <div class="flex grow">
      <div class="relative z-[1010] mt-1 border-r border-border bg-background">
        <div
          class="cursor-pointer p-2"
          @click="activeTab = 'components'"
        >
          <UilServer
            class="size-6"
            :class="activeTab === 'components' ? 'text-foreground' : 'text-muted-foreground'"
          />
        </div>
        <div
          class="cursor-pointer p-2"
          @click="activeTab = 'tree'"
        >
          <UilListUiAlt
            class="size-6"
            :class="activeTab === 'tree' ? 'text-foreground' : 'text-muted-foreground'"
          />
        </div>
      </div>
      <div
        class="h-[calc(100vh-var(--header-height)-var(--sidebar-footer-height))] w-full overflow-y-auto bg-background"
      >
        <ComponentList v-if="activeTab === 'components'" />
        <TreeComponents v-if="activeTab === 'tree'" />
      </div>
    </div>
    <div class="z-[1010] h-[var(--sidebar-footer-height)] shrink-0 overflow-y-auto bg-background">
      <SidebarFooter />
    </div>
  </div>
</template>
