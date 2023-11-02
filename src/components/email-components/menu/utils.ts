import type { MultiTool, Tool } from '@/types/editor'
import type { Menu } from '@/types/email-components/menu'

export function getMenuItems(tools: Tool[]): Menu[] | undefined {
  const tool = tools.find(i => i.type === 'multi')?.value as MultiTool['value']

  if (!tool)
    return

  return tool.map((item) => {
    return {
      text: item.tools[0].value as string,
      link: item.tools[1].value as string,
      color: item.tools[2].value as string,
      fontSize: item.tools[3].value as number,
    }
  })
}
