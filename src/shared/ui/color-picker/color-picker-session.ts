export function createColorPickerCommitSession(onCommit: (value: string) => void) {
  let pendingValue: string | undefined
  return {
    update(value: string) {
      pendingValue = value
    },
    flush() {
      if (pendingValue === undefined)
        return
      const value = pendingValue
      pendingValue = undefined
      onCommit(value)
    },
    discard() {
      pendingValue = undefined
    },
  }
}

export function snapshotColorPalettes(recent: readonly string[], document: readonly string[]) {
  return {
    recent: [...recent],
    document: [...document],
  }
}
