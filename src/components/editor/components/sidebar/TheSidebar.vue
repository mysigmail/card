<script setup lang="ts">
import UilListUiAlt from '~icons/uil/list-ui-alt'
import UilServer from '~icons/uil/server'
import { useComponentsStore } from '@/store/components'

const { sidebarActiveTab } = useComponentsStore()
</script>

<template>
  <div class="flex flex-col border-r border-border">
    <div class="flex grow">
      <div class="relative z-20 mt-1 border-r border-border bg-background">
        <div
          class="cursor-pointer p-2"
          @click="sidebarActiveTab = 'components'"
        >
          <UilServer
            class="size-6 hover:text-foreground"
            :class="sidebarActiveTab === 'components' ? 'text-foreground' : 'text-muted-foreground'"
          />
        </div>
        <div
          class="cursor-pointer p-2"
          @click="sidebarActiveTab = 'tree'"
        >
          <UilListUiAlt
            class="size-6 hover:text-foreground"
            :class="sidebarActiveTab === 'tree' ? 'text-foreground' : 'text-muted-foreground'"
          />
        </div>
      </div>
      <div
        class="h-[calc(100vh-var(--header-height)-var(--sidebar-footer-height))] w-full overflow-y-auto bg-background"
      >
        <ComponentList v-if="sidebarActiveTab === 'components'" />
        <TreeComponents v-if="sidebarActiveTab === 'tree'" />
      </div>
    </div>
    <div class="z-10 h-[var(--sidebar-footer-height)] shrink-0 overflow-y-auto bg-background">
      <SidebarFooter />
    </div>
  </div>
</template>
