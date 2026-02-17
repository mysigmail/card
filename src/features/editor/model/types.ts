export { ToolT } from '@/entities/template'
export type {
  AlignTool,
  BackgroundImageTool,
  BaseTool,
  BlockLibraryCategory,
  BlockPreset,
  CanvasBlockInstance,
  ColorPickerTool,
  ColumnCollectionTool,
  ComponentTheme,
  ComponentType,
  GeneralTool,
  ImageTool,
  InputNumberTool,
  InputTool,
  MultiTool,
  SelectTool,
  SingleTool,
  SpacingTool,
  TextEditorTool,
  ToggleTool,
  Tool,
  ToolCollectionItem,
  ToolGroupRef,
  ToolGroupRole,
  ToolType,
} from '@/entities/template'

export type BlockSelectionLevel = 'block' | 'row' | 'cell' | 'atom'
export type SidebarTab = 'library' | 'tree'
export type PreviewMode = 'desktop' | 'mobile'

export interface EditorSelectionSnapshot {
  editableId?: string
  selectedBlockId?: string
  selectedRowId?: string
  selectedCellId?: string
  selectedAtomId?: string
  selectionLevel?: BlockSelectionLevel
  sidebarActiveTab: SidebarTab
}
