<script setup lang="ts">
import type { UploadFile, UploadInstance } from 'element-plus'
import type { TemplateImportMode } from '@/types/template'
import { computed, ref } from 'vue'
import { useComponentsStore } from '@/store/components'

const importDialogVisible = ref(false)
const importMode = ref<TemplateImportMode>('replace')
const applyGeneralInAppend = ref(false)
const importStatus = ref<'idle' | 'error'>('idle')
const importMessage = ref('')
const pendingImportRaw = ref('')
const pendingImportFileName = ref('')
const uploadRef = ref<UploadInstance>()

const { exportTemplateJson, importTemplateFromJson, templateImportIssues, clearCanvas }
  = useComponentsStore()

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

function openImportDialog() {
  importDialogVisible.value = true
}

function resetImportDialog() {
  importStatus.value = 'idle'
  importMessage.value = ''
  pendingImportRaw.value = ''
  pendingImportFileName.value = ''
  uploadRef.value?.clearFiles()
}

function closeImportDialog() {
  importDialogVisible.value = false
}

async function onImportFileChange(file: UploadFile) {
  const rawFile = file.raw

  if (!rawFile)
    return

  try {
    pendingImportRaw.value = await rawFile.text()
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
</script>

<template>
  <div class="header">
    <div class="logo">
      <SvgLogoWhite
        height="19"
        width="90"
      />
    </div>
    <div class="tools">
      tools
    </div>
    <div class="actions">
      <ElButton
        size="small"
        @click="exportTemplateToFile"
      >
        Export JSON
      </ElButton>
      <ElButton
        type="primary"
        size="small"
        @click="openImportDialog"
      >
        Import JSON
      </ElButton>
      <ElPopconfirm
        title="This will remove all blocks from canvas. Continue?"
        confirm-button-text="Yes"
        cancel-button-text="Cancel"
        width="300"
        @confirm="clearCanvas"
      >
        <template #reference>
          <ElButton
            type="success"
            size="small"
          >
            New
          </ElButton>
        </template>
      </ElPopconfirm>
    </div>

    <ElDialog
      v-model="importDialogVisible"
      title="Import template JSON"
      width="560px"
      @closed="resetImportDialog"
    >
      <div class="import-dialog">
        <div class="import-dialog__mode">
          <span class="import-dialog__label">Import mode:</span>
          <ElRadioGroup v-model="importMode">
            <ElRadioButton label="replace">
              Replace
            </ElRadioButton>
            <ElRadioButton label="append">
              Append
            </ElRadioButton>
          </ElRadioGroup>
        </div>

        <ElCheckbox
          v-model="applyGeneralInAppend"
          :disabled="importMode !== 'append'"
        >
          Apply general settings in append mode
        </ElCheckbox>

        <ElUpload
          ref="uploadRef"
          drag
          accept=".json,application/json"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="onImportFileChange"
        >
          <div class="import-dialog__upload">
            Drop JSON file here or click to select
          </div>
        </ElUpload>

        <div
          v-if="pendingImportFileName"
          class="import-dialog__file"
        >
          Selected file: <strong>{{ pendingImportFileName }}</strong>
        </div>

        <ElAlert
          v-if="importStatus === 'error'"
          type="error"
          :closable="false"
          :title="importMessage"
          show-icon
        />

        <ul
          v-if="visibleImportIssues.length"
          class="import-dialog__issues"
        >
          <li
            v-for="issue in visibleImportIssues"
            :key="`${issue.path}_${issue.message}`"
          >
            <code>{{ issue.path }}</code>: {{ issue.message }}
          </li>
        </ul>
      </div>

      <template #footer>
        <ElButton @click="closeImportDialog">
          Cancel
        </ElButton>
        <ElButton
          type="primary"
          :disabled="!canImport"
          @click="confirmImport"
        >
          Import
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-sm);
  background-color: var(--color-contrast-high);
  color: var(--color-contrast-low);
  justify-content: space-between;

  .logo {
    display: flex;
    align-items: center;
  }

  .actions {
    display: flex;
    align-items: center;
  }
}

.import-dialog {
  display: grid;
  gap: 12px;

  &__mode {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__label {
    color: var(--color-contrast-medium);
    font-size: 13px;
  }

  &__upload {
    color: var(--color-contrast-medium);
    font-size: 13px;
  }

  &__file {
    color: var(--color-contrast-medium);
    font-size: 13px;
  }

  &__issues {
    margin: 0;
    padding-left: 16px;
    max-height: 140px;
    overflow: auto;
    color: #ab2e2e;
    font-size: 12px;
    display: grid;
    gap: 4px;
  }
}
</style>
