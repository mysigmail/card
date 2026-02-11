<script setup lang="ts">
import type { TemplateImportMode } from '@/types/template'
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useComponentsStore } from '@/store/components'

const importDialogVisible = ref(false)
const clearDialogVisible = ref(false)
const importMode = ref<TemplateImportMode>('replace')
const applyGeneralInAppend = ref(false)
const importStatus = ref<'idle' | 'error'>('idle')
const importMessage = ref('')
const pendingImportRaw = ref('')
const pendingImportFileName = ref('')
const fileInputRef = ref<HTMLInputElement>()

const { exportTemplateJson, importTemplateFromJson, templateImportIssues, clearCanvas }
  = useComponentsStore()

const importModeValue = computed<string>({
  get: () => importMode.value,
  set: (next) => {
    if (next === 'replace' || next === 'append')
      importMode.value = next
  },
})

const visibleImportIssues = computed(() => {
  if (importStatus.value !== 'error')
    return []

  return templateImportIssues.value.slice(0, 10)
})

const canImport = computed(() => Boolean(pendingImportRaw.value))

function exportTemplateToFile() {
  const now = new Date().toISOString().replace(/[:.]/g, '-')
  const payload = exportTemplateJson()
  const file = new Blob([payload], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(file)

  const link = document.createElement('a')
  link.href = url
  link.download = `email-template-${now}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  importStatus.value = 'idle'
  importMessage.value = ''
}

function resetImportDialog() {
  importStatus.value = 'idle'
  importMessage.value = ''
  pendingImportRaw.value = ''
  pendingImportFileName.value = ''
  importMode.value = 'replace'
  applyGeneralInAppend.value = false

  if (fileInputRef.value)
    fileInputRef.value.value = ''
}

function openImportDialog() {
  resetImportDialog()
  importDialogVisible.value = true
}

function closeImportDialog() {
  importDialogVisible.value = false
}

function clearCanvasWithConfirm() {
  clearDialogVisible.value = true
}

async function onImportFileChange(event: Event) {
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]

  if (!file) {
    pendingImportRaw.value = ''
    pendingImportFileName.value = ''
    return
  }

  try {
    pendingImportRaw.value = await file.text()
    pendingImportFileName.value = file.name
    importStatus.value = 'idle'
    importMessage.value = ''
  }
  catch {
    importStatus.value = 'error'
    importMessage.value = 'Failed to read selected file.'
  }
}

function confirmImport() {
  const result = importTemplateFromJson(pendingImportRaw.value, importMode.value, {
    applyGeneralInAppend: importMode.value === 'append' && applyGeneralInAppend.value,
  })

  if (result.ok) {
    closeImportDialog()
    return
  }

  importStatus.value = 'error'
  importMessage.value = 'Import failed. Check validation errors below.'
}

watch(importDialogVisible, (open) => {
  if (!open)
    resetImportDialog()
})
</script>

<template>
  <div class="flex items-center justify-between bg-foreground px-4 text-secondary">
    <div class="flex items-center">
      <SvgLogoWhite
        height="19"
        width="90"
      />
    </div>
    <div class="tools">
      tools
    </div>
    <div class="actions flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        @click="exportTemplateToFile"
      >
        Export JSON
      </Button>
      <Button
        size="sm"
        @click="openImportDialog"
      >
        Import JSON
      </Button>
      <Button
        variant="outline"
        size="sm"
        @click="clearCanvasWithConfirm"
      >
        New
      </Button>
    </div>
  </div>

  <Dialog v-model:open="importDialogVisible">
    <DialogContent class="sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle>Import template JSON</DialogTitle>
      </DialogHeader>

      <div class="grid gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm text-muted-foreground">Import mode:</span>
          <ToggleGroup
            v-model="importModeValue"
            type="single"
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="replace">
              Replace
            </ToggleGroupItem>
            <ToggleGroupItem value="append">
              Append
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <label class="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch
            v-model:checked="applyGeneralInAppend"
            :disabled="importMode !== 'append'"
          />
          <span>Apply general settings in append mode</span>
        </label>

        <div class="grid gap-1.5">
          <span class="text-sm text-muted-foreground">JSON file</span>
          <input
            ref="fileInputRef"
            accept=".json,application/json"
            class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:mr-3 file:inline-flex file:h-7 file:cursor-pointer file:items-center file:rounded-md file:border file:border-input file:bg-background file:px-2.5 file:text-xs file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            type="file"
            @change="onImportFileChange"
          >
        </div>

        <div
          v-if="pendingImportFileName"
          class="text-sm text-muted-foreground"
        >
          Selected file: <strong>{{ pendingImportFileName }}</strong>
        </div>

        <div
          v-if="importStatus === 'error'"
          class="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {{ importMessage }}
        </div>

        <ul
          v-if="visibleImportIssues.length"
          class="max-h-36 list-disc space-y-1 overflow-auto pl-5 text-xs text-destructive"
        >
          <li
            v-for="issue in visibleImportIssues"
            :key="`${issue.path}_${issue.message}`"
          >
            <code>{{ issue.path }}</code>: {{ issue.message }}
          </li>
        </ul>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          @click="closeImportDialog"
        >
          Cancel
        </Button>
        <Button
          :disabled="!canImport"
          @click="confirmImport"
        >
          Import
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="clearDialogVisible">
    <DialogContent class="sm:max-w-[420px]">
      <DialogHeader>
        <DialogTitle>Clear canvas?</DialogTitle>
      </DialogHeader>
      <p class="text-sm text-muted-foreground">
        This will remove all blocks from canvas.
      </p>
      <DialogFooter>
        <Button
          variant="outline"
          @click="clearDialogVisible = false"
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          @click="
            clearCanvas()
            clearDialogVisible = false
          "
        >
          Yes
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
