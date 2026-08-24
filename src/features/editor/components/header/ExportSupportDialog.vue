<script setup lang="ts">
import { Heart, Star } from 'lucide-vue-next'
import { useExportSupportDialog } from '@/features/editor/model'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

const { exportSupportDialogVisible, closeExportSupportDialog } = useExportSupportDialog()

function onOpenChange(open: boolean) {
  if (!open && exportSupportDialogVisible.value)
    closeExportSupportDialog()
}
</script>

<template>
  <Dialog
    :open="exportSupportDialogVisible"
    @update:open="onOpenChange"
  >
    <DialogContent class="sm:max-w-[440px]">
      <div
        class="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
      >
        <Star class="size-6 fill-current" />
      </div>

      <DialogHeader class="text-center sm:text-center">
        <DialogTitle>Your email is ready 🎉</DialogTitle>
        <DialogDescription class="leading-6">
          Card is free and open source. If it saves you time, support the project with a GitHub star
          or a donation.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-2">
        <Button
          as="a"
          href="https://github.com/mysigmail/card"
          target="_blank"
          rel="noopener noreferrer"
          @click="closeExportSupportDialog"
        >
          <Star class="fill-current" />
          Star Card on GitHub
        </Button>
        <Button
          as="a"
          variant="outline"
          href="https://opencollective.com/mysigmail"
          target="_blank"
          rel="noopener noreferrer"
          @click="closeExportSupportDialog"
        >
          <Heart />
          Support development
        </Button>
        <Button
          variant="ghost"
          class="text-muted-foreground"
          @click="closeExportSupportDialog"
        >
          Not now
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
