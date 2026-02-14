# Каталог блоков (Catalog)

В этой директории находятся заготовки блоков для конструктора писем.

## Как добавить новый блок

### 1. Через JSON (Рекомендуемый способ)
Блоки хранятся в виде JSON-файлов в директории `./blocks/`.

#### Создание JSON-файла
Вы можете сохранить любой блок прямо из интерфейса редактора. Нажмите кнопку «Save as Block» в дереве блоков, выберите категорию, и файл будет скачан. Затем просто переместите его в `src/features/email-preview/catalog/blocks/`.

Пример структуры (`header1.json`):
```json
{
  "version": 2,
  "name": "header1",
  "label": "Header 1",
  "type": "header",
  "preview": "img/components/header-1.png",
  "block": {
    "id": "6DN_P3qn",
    "label": "Header 1",
    "settings": { ... },
    "rows": [ ... ]
  }
}
```

- **version**: Должна быть `2`.
- **name**: Уникальный идентификатор.
- **label**: Отображаемое название в интерфейсе.
- **type**: Категория (`header`, `content`, `menu`, `feature`, `cta`, `ecommerce`, `footer`).
- **preview**: Путь к превью (относительно `public/`).
- **block**: Объект данных блока.

### 2. Программный способ (TypeScript)
Для создания сложных блоков можно использовать TypeScript. Ниже приведен полный пример реализации.

Пример реализации (`header1.ts`):
```typescript
import type { BlockNode } from '@/entities/block'
import type { BlockPreset, ComponentTheme } from '@/entities/template'
import { nanoid } from 'nanoid'
import { createBlockNode, createRowNode } from '@/entities/block'
import {
  buildImageAtom,
  buildTextAtom,
  createCell,
  createMenuTextAtom,
  resetRow,
} from '@/features/email-preview/catalog/composer-helpers'
import { images } from '@/features/email-preview/catalog/images'
import { COLOR } from '@/features/email-preview/constants'

function buildHeader1Block(label: string): BlockNode {
  const block = createBlockNode(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = COLOR.theme.dark
  block.settings.backgroundImage = {
    url: '/img/josh-nuttall-pIwu5XNvXpk-unsplash.png',
    position: 'center',
    repeat: 'no-repeat',
    size: 'cover',
  }

  const topRow = block.rows[0]
  resetRow(topRow)
  topRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      width: 35,
      atoms: [
        buildImageAtom({
          src: images.logo.white,
          width: 110,
        }),
      ],
    }),
    createCell({
      horizontalAlign: 'right',
      verticalAlign: 'top',
      width: 65,
      atoms: [createMenuTextAtom(COLOR.theme.light, { gap: 10 })],
    }),
  ]

  const textRow = createRowNode([])
  resetRow(textRow)
  textRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        buildTextAtom({
          value:
            '<p><strong><span style="font-size: 18px">Unleash Freedom</span></strong></p><p><span style="color: rgb(159, 249, 141); font-size: 48px">Discover</span><span style="font-size: 48px"> the Unmatched Thrill with Our </span><span style="color: #9FF98D; font-size: 48px">New Bicycle</span></p>',
          color: COLOR.theme.light,
          spacing: {
            margin: [50, 0, 0, 0],
            padding: [0, 0, 0, 0],
          },
        }),
      ],
    }),
  ]

  block.rows = [topRow, textRow]

  return block
}

export function header1Block(_: ComponentTheme, label: string): BlockPreset {
  return {
    id: nanoid(8),
    version: 2,
    name: 'header1',
    label,
    type: 'header',
    preview: images.components.header1,
    block: buildHeader1Block(label),
  }
}
```

### 3. Управление порядком отображения
Добавьте `name` вашего блока в константу `BLOCK_ORDER` в файле `src/features/email-preview/catalog/load-blocks.ts`.

```typescript
const BLOCK_ORDER: Record<ComponentType, string[]> = {
  header: [
    'header7',
    'header1', // Имя блока
  ],
  // ...
}
```
