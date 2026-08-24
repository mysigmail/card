// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const storage = new Map<string, string>()

const localStorageMock: Storage = {
  get length() {
    return storage.size
  },
  clear() {
    storage.clear()
  },
  getItem(key) {
    return storage.get(key) ?? null
  },
  key(index) {
    return [...storage.keys()][index] ?? null
  },
  removeItem(key) {
    storage.delete(key)
  },
  setItem(key, value) {
    storage.set(key, value)
  },
}

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: localStorageMock,
})

describe('export support dialog', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.resetModules()
  })

  it('shows after the first export and then every five exports', async () => {
    const { useExportSupportDialog }
      = await import('@/features/editor/model/use-export-support-dialog')
    const dialog = useExportSupportDialog()
    const shownAt: number[] = []

    for (let exportCount = 1; exportCount <= 110; exportCount++) {
      dialog.recordExportAndMaybeShowDialog()

      if (dialog.exportSupportDialogVisible.value) {
        shownAt.push(exportCount)
        dialog.closeExportSupportDialog()
      }
    }

    expect(shownAt).toEqual([1, ...Array.from({ length: 22 }, (_, index) => (index + 1) * 5)])
  })

  it('preserves the export progression between sessions', async () => {
    const firstSession = await import('@/features/editor/model/use-export-support-dialog')
    const firstDialog = firstSession.useExportSupportDialog()

    firstDialog.recordExportAndMaybeShowDialog()
    firstDialog.closeExportSupportDialog()
    firstDialog.recordExportAndMaybeShowDialog()
    firstDialog.recordExportAndMaybeShowDialog()

    vi.resetModules()
    const nextSession = await import('@/features/editor/model/use-export-support-dialog')
    const nextDialog = nextSession.useExportSupportDialog()

    nextDialog.recordExportAndMaybeShowDialog()
    expect(nextDialog.exportSupportDialogVisible.value).toBe(false)

    nextDialog.recordExportAndMaybeShowDialog()
    expect(nextDialog.exportSupportDialogVisible.value).toBe(true)
  })
})
