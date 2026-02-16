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
