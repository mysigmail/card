<script setup lang="ts">
import { version } from '#/package.json'

const year = new Date().getFullYear()
</script>

<template>
  <div class="p-4 text-xs text-muted-foreground">
    <div class="leading-[18px]">
      <div class="mb-2 rounded-md border border-input p-2">
        If you like this project,<br>please give it a
        <svg
          class="relative top-[3px] fill-[#e5c764]"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 32 32"
        >
          <path
            d="m16 2l-4.55 9.22l-10.17 1.47l7.36 7.18L6.9 30l9.1-4.78L25.1 30l-1.74-10.13l7.36-7.17l-10.17-1.48Z"
          />
        </svg>
        on
        <a
          class="text-muted-foreground"
          href="https://github.com/mysigmail/card"
          target="_blank"
          rel="noopener noreferrer"
        >GitHub</a>!
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
