export { ToolT } from '@/entities/template'
export type {
  AlignTool,
  BackgroundImageTool,
  BaseTool,
  BlockPreset,
  CanvasBlockInstance,
  CanvasNode,
  ColorPickerTool,
  ColumnCollectionTool,
  ComponentList,
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
export type SidebarTab = 'components' | 'tree'
export type PreviewMode = 'desktop' | 'mobile'
