<script setup lang="ts">
import { version } from '#/package.json'

const year = new Date().getFullYear()
</script>

<template>
  <div class="p-3 text-xs text-muted-foreground">
    <SidebarSupportCard class="mb-2" />
    <div class="leading-4">
      v{{ version }}&nbsp;•&nbsp;
      <a
        class="text-muted-foreground"
        href="https://github.com/mysigmail/card/releases"
        target="_blank"
        rel="noopener noreferrer"
      >Changelog</a>
    </div>
    <div class="leading-4">
      ©{{ year }}&nbsp;•&nbsp;Anton Reshetov
    </div>
  </div>
</template>
