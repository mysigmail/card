<script setup lang="ts">
import { version } from '#/package.json'
import { Star } from 'lucide-vue-next'

const year = new Date().getFullYear()
</script>

<template>
  <div class="p-4 text-xs text-muted-foreground">
    <div class="leading-[18px]">
      <div class="mb-2 rounded-md border border-input py-2 px-3">
        If you like this project,<br>please give it a
        <span class="">
          <Star class="size-4 fill-yellow-500 text-yellow-500 inline-flex relative -top-[1px]" />
          on
          <a
            class="text-muted-foreground underline-offset-4 underline hover:text-primary"
            href="https://github.com/mysigmail/card"
            target="_blank"
            rel="noopener noreferrer"
          >GitHub</a>!
        </span>
      </div>
    </div>
    <div class="leading-[18px]">
      v{{ version }}&nbsp;•&nbsp;
      <a
        class="text-muted-foreground"
        href="https://github.com/mysigmail/card/releases"
        target="_blank"
        rel="noopener noreferrer"
      >Changelog</a>
    </div>
    <div class="leading-[18px]">
      ©{{ year }}&nbsp;•&nbsp;Anton Reshetov
    </div>
  </div>
</template>
