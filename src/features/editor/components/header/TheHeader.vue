<script setup lang="ts">
import { Monitor, MoreHorizontal, Smartphone } from 'lucide-vue-next'
import { Button } from '@/shared/ui/button'
import { ButtonGroup } from '@/shared/ui/button-group'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Switch } from '@/shared/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import { useHeaderActions } from './use-header-actions'

const {
  importDialogVisible,
  clearDialogVisible,
  importMode,
  applyGeneralInAppend,
  importStatus,
  importMessage,
  pendingImportFileName,
  fileInputRef,
  importModeValue,
  previewModeValue,
  visibleImportIssues,
  canImport,
  exportTemplateToFile,
  exportTemplateHtmlToFile,
  openImportDialog,
  closeImportDialog,
  clearCanvasWithConfirm,
  onConfirmClearCanvas,
  onImportFileChange,
  confirmImport,
} = useHeaderActions()
</script>

<template>
  <div
    data-slot="editor-header"
    class="flex items-center justify-between bg-foreground px-4 text-secondary"
  >
    <div class="flex items-center">
      <SvgLogoWhite width="100" />
    </div>
    <div class="tools flex items-center justify-center">
      <ToggleGroup
        v-model="previewModeValue"
        type="single"
        variant="outline"
        size="xs"
      >
        <ToggleGroupItem value="desktop">
          <Monitor class="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="mobile">
          <Smartphone class="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
    <div class="actions flex items-center">
      <ButtonGroup>
        <Button
          size="sm"
          variant="outline"
          @click="clearCanvasWithConfirm"
        >
          New
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="More Options"
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export</DropdownMenuLabel>
            <DropdownMenuItem @select="exportTemplateHtmlToFile">
              HTML
            </DropdownMenuItem>
            <DropdownMenuItem @select="exportTemplateToFile">
              Template JSON
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Import</DropdownMenuLabel>
            <DropdownMenuItem @select="openImportDialog">
              Template JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
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
          @click="onConfirmClearCanvas()"
        >
          Yes
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
