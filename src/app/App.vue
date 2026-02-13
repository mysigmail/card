<script setup lang="ts">
import { TheEditor, TheHeader } from '@/features/editor'
import { useTelemetry } from '@/services/telemetry'

useTelemetry()
</script>

<template>
  <div
    id="app"
    class="grid h-screen [grid-template-rows:var(--header-height)_1fr]"
  >
    <TheHeader />
    <TheEditor />
  </div>
</template>
