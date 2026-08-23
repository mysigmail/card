import { describe, expect, it, vi } from 'vitest'
import {
  createColorPickerCommitSession,
  snapshotColorPalettes,
} from '@/shared/ui/color-picker/color-picker-session'

describe('color picker commit session', () => {
  it('stages multiple selection sources and commits only the final value on flush', () => {
    const commit = vi.fn()
    const session = createColorPickerCommitSession(commit)
    session.update('#111111')
    session.update('#222222')
    session.update('rgba(51,51,51,0.5)')
    expect(commit).not.toHaveBeenCalled()
    session.flush()
    session.flush()
    expect(commit).toHaveBeenCalledTimes(1)
    expect(commit).toHaveBeenCalledWith('rgba(51,51,51,0.5)')
  })

  it('discards reset selections without committing recent color', () => {
    const commit = vi.fn()
    const session = createColorPickerCommitSession(commit)
    session.update('#111111')
    session.discard()
    session.flush()
    expect(commit).not.toHaveBeenCalled()
  })

  it('keeps opened palettes stable until the next snapshot', () => {
    const recent = ['#111111']
    const document = ['#222222']
    const opened = snapshotColorPalettes(recent, document)

    recent.unshift('#333333')
    document.push('#444444')
    expect(opened).toEqual({ recent: ['#111111'], document: ['#222222'] })
    expect(snapshotColorPalettes(recent, document)).toEqual({
      recent: ['#333333', '#111111'],
      document: ['#222222', '#444444'],
    })
  })
})
