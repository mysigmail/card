<script setup lang="ts">
import UilListUiAlt from '~icons/uil/list-ui-alt'
import UilServer from '~icons/uil/server'
import { useSelection } from '@/features/editor/model'
import BlockLibrary from '../library/BlockLibrary.vue'
import Tree from '../tree/Tree.vue'

const { sidebarActiveTab } = useSelection()
</script>

<template>
  <div
    data-slot="editor-sidebar"
    class="flex flex-col border-r border-border"
  >
    <div class="flex grow">
      <div class="relative z-20 mt-1 border-r border-border bg-background">
        <div
          class="cursor-pointer p-2"
          @click="sidebarActiveTab = 'library'"
        >
          <UilServer
            class="size-6 hover:text-foreground"
            :class="sidebarActiveTab === 'library' ? 'text-foreground' : 'text-muted-foreground'"
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
        <BlockLibrary v-if="sidebarActiveTab === 'library'" />
        <Tree v-if="sidebarActiveTab === 'tree'" />
      </div>
    </div>
    <div class="z-10 h-[var(--sidebar-footer-height)] shrink-0 overflow-y-auto bg-background">
      <SidebarFooter />
    </div>
  </div>
</template>
