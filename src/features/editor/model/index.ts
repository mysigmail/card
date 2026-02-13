import type { TemplateValidationIssue } from '@/entities/template'
import { ref } from 'vue'
import { createCanvasModule, createCanvasState } from './canvas'
import { createPersistenceModule } from './persistence'
import { createSelectionModule } from './selection'
import { createTemplateIOModule } from './template-io'

export * from './types'

const templateImportIssues = ref<TemplateValidationIssue[]>([])

const canvasState = createCanvasState()

const selectionModule = createSelectionModule({
  editableId: canvasState.editableId,
  installed: canvasState.installed,
})

let persistTemplateToLocalStorage: () => void = () => {}

const templateIOModule = createTemplateIOModule({
  installed: canvasState.installed,
  general: canvasState.general,
  templateImportIssues,
  resetSelection: selectionModule.resetSelection,
  persistTemplateToLocalStorage: () => persistTemplateToLocalStorage(),
})

const persistenceModule = createPersistenceModule({
  installed: canvasState.installed,
  general: canvasState.general,
  templateImportIssues,
  exportTemplateJson: templateIOModule.exportTemplateJson,
  applyImportedTemplate: templateIOModule.applyImportedTemplate,
  withPersistLock: templateIOModule.withPersistLock,
  isPersistIgnored: templateIOModule.isPersistIgnored,
})

persistTemplateToLocalStorage = persistenceModule.persistTemplateToLocalStorage

const canvasModule = createCanvasModule({
  state: canvasState,
  selection: {
    selectedRowId: selectionModule.selectedRowId,
    selectedCellId: selectionModule.selectedCellId,
    selectedAtomId: selectionModule.selectedAtomId,
    selectedAtom: selectionModule.selectedAtom,
    resetSelection: selectionModule.resetSelection,
    selectBlock: selectionModule.selectBlock,
    selectRow: selectionModule.selectRow,
    selectCell: selectionModule.selectCell,
  },
  templateImportIssues,
})

export function useComponentsStore() {
  persistenceModule.initTemplatePersistence()

  return {
    addComponent: canvasModule.addComponent,
    addNewToolToMultiTool: canvasModule.addNewToolToMultiTool,
    deleteMultiToolItem: canvasModule.deleteMultiToolItem,
    duplicateComponent: canvasModule.duplicateComponent,
    duplicateComponentById: canvasModule.duplicateComponentById,
    editableId: canvasState.editableId,
    editableIndex: canvasModule.editableIndex,
    general: canvasState.general,
    installed: canvasState.installed,
    isDragging: canvasState.isDragging,
    list: canvasState.list,
    moveComponent: canvasModule.moveComponent,
    exportTemplate: templateIOModule.exportTemplate,
    exportTemplateJson: templateIOModule.exportTemplateJson,
    importTemplate: templateIOModule.importTemplate,
    importTemplateFromJson: templateIOModule.importTemplateFromJson,
    applyImportedTemplate: templateIOModule.applyImportedTemplate,
    hydrateTemplateFromLocalStorage: persistenceModule.hydrateTemplateFromLocalStorage,
    persistTemplateToLocalStorage: persistenceModule.persistTemplateToLocalStorage,
    templateImportIssues,
    clearCanvas: canvasModule.clearCanvas,
    removeComponent: canvasModule.removeComponent,
    removeComponentById: canvasModule.removeComponentById,
    updateToolById: canvasModule.updateToolById,
    resetSelection: selectionModule.resetSelection,
    insertBlockToCanvas: canvasModule.insertBlockToCanvas,
    renameBlock: canvasModule.renameBlock,
    insertRowToBlock: canvasModule.insertRowToBlock,
    insertRowToCell: canvasModule.insertRowToCell,
    removeRow: canvasModule.removeRow,
    insertCellToRow: canvasModule.insertCellToRow,
    removeCell: canvasModule.removeCell,
    insertAtomToCell: canvasModule.insertAtomToCell,
    removeAtom: canvasModule.removeAtom,
    moveAtomWithinCell: canvasModule.moveAtomWithinCell,
    selectBlock: selectionModule.selectBlock,
    selectRow: selectionModule.selectRow,
    selectCell: selectionModule.selectCell,
    selectAtom: selectionModule.selectAtom,
    selectedBlock: selectionModule.selectedBlock,
    selectedRow: selectionModule.selectedRow,
    selectedCell: selectionModule.selectedCell,
    selectedAtom: selectionModule.selectedAtom,
    selectedBlockId: selectionModule.selectedBlockId,
    selectedRowId: selectionModule.selectedRowId,
    selectedCellId: selectionModule.selectedCellId,
    selectedAtomId: selectionModule.selectedAtomId,
    selectionLevel: selectionModule.selectionLevel,
    sidebarActiveTab: selectionModule.sidebarActiveTab,
    treeScrollTarget: selectionModule.treeScrollTarget,
    treeScrollRequestId: selectionModule.treeScrollRequestId,
    requestTreeScroll: selectionModule.requestTreeScroll,
    installedBlocks: canvasModule.installedBlocks,
    isCanvasBlockInstance: canvasModule.isCanvasBlockInstance,
  }
}
