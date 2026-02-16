# AGENTS

Этот документ описывает, как агенту безопасно менять код в проекте email-конструктора на Vue 3 + TypeScript.
Главный принцип: **JSON-структура шаблона первична**, HTML-превью вторично.

## 0. Приоритеты изменений

Перед любым изменением соблюдай порядок:
1. Сохранить контракт данных шаблона (`version`, структура, лимиты, санитизация).
2. Не ломать инварианты дерева `Block -> Row -> Cell -> Atom`.
3. Не нарушать email-совместимость (табличная верстка, inline-стили).
4. Не ломать UX редактора (выделение, дерево, импорт/экспорт, localStorage).

## 1. Навыки агента (Agent Skills)

Для сложных задач по рефакторингу, декомпозиции или созданию новых модулей обязательно активируй:
- **`architecture-standards`** — стандарты проектирования (Domain/Logic/UI), правила именования и чек-лист декомпозиции. (Локация: `.agents/skills/architecture-standards/SKILL.md`)

## 2. Архитектурная карта (FSD-lite)

- `src/app` — инициализация приложения (`main.ts`, `App.vue`), глобальные стили (`styles/`).
- `src/assets` — статические ресурсы (шрифты, изображения).
- `src/entities` — доменные сущности и бизнес-логика (`block`, `style`, `template`).
- `src/features` — фичи редактора и превью (`editor`, `email-preview`).
- `src/services` — внешние интеграции (`telemetry`).
- `src/shared` — общие UI-компоненты (`ui/`), утилиты (`lib/`), ассеты (`assets/`).
- `src/types` — автогенерированные типы (`auto-imports.d.ts`, `components.d.ts`, `extensions.d.ts`).
- `src/views` — страницы-контейнеры (`Main.vue`).

## 2. Доменная модель и инварианты

Базовая иерархия:
`BlockNode` -> `RowNode` -> `CellNode` -> `Atom`.

Ключевые сущности:
- `BlockNode` содержит `rows`, `settings` (`BlockSettings`) и `label`.
- `RowNode` содержит `cells` и `settings` (`RowSettings` с `gap`, optional `height`, optional `hiddenOnMobile`, optional `collapseOnMobile`).
- `CellNode` содержит `atoms`, `rows` (вложенность поддерживается рекурсивно) и `settings` (`CellSettings` с `verticalAlign`, `horizontalAlign`, `borderRadius`, `width`, `height`, `link`, optional `hiddenOnMobile`).
- `Atom` — контентный узел (`text`, `button`, `divider`, `image`, `menu`). Базовый `BaseAtom` имеет `id`, `type`, optional `spacing`, optional `hiddenOnMobile`.
- `CanvasBlockInstance` — элемент канваса с `id`, `version: 2`, `block`.
- `BlockPreset` — расширяет `CanvasBlockInstance`, добавляет `name`, `label`, `type` (`ComponentType`), `preview`.

Типы атомов:
- `TextAtom` — `value` (HTML), `color`.
- `ButtonAtom` — `text`, `link`, `backgroundColor`, `color`, `fontSize`, `borderRadius`, `padding`.
- `DividerAtom` — `color`, `height`.
- `ImageAtom` — `src`, `link`, `alt`, optional `width`, `height`, `borderRadius`.
- `MenuAtom` — `items` (`MenuAtomItem[]`), optional `itemType` (`text` | `image`), `gap`. Элементы: `MenuAtomTextItem` или `MenuAtomImageItem`.

ID-правила:
- В данных узлов хранятся "сырые" id (`nanoid(8)`), без префиксов.
- Префиксы `block:`, `row:`, `cell:`, `atom:` используются в UI (`data-node-id`, tree scroll target), а не в persisted-данных.

## 3. Source of Truth (куда идти за изменениями)

| Что меняем | Файл |
| :--- | :--- |
| Типы дерева блока (`BlockNode`, `RowNode`, `CellNode`, `Atom`) | `src/entities/block/types.ts` |
| Фабрики узлов/атомов | `src/entities/block/block-factory.ts` |
| Типы spacing/background | `src/entities/style/types.ts` |
| Контракт шаблона (`TemplateExportV2`, `CanvasBlockInstance`, `BlockPreset`, `Tool`, `GeneralTool`, лимиты) | `src/entities/template/types.ts` |
| Валидация/санитизация/migration/remap id шаблона | `src/entities/template/template-io.ts` |
| Barrel-export модели редактора | `src/features/editor/model/index.ts` |
| Типы модели редактора (`BlockSelectionLevel`, `SidebarTab`, re-export entities) | `src/features/editor/model/types.ts` |
| Shared reactive state (`installed`, `editableId`, `isDragging`, `previewMode`, `general`, `list`, `templateImportIssues`) | `src/features/editor/model/state.ts` |
| CRUD дерева на канвасе | `src/features/editor/model/use-canvas.ts` (`useCanvas`) |
| Выделение block/row/cell/atom, sidebar tab, tree scroll | `src/features/editor/model/use-selection.ts` (`useSelection`) |
| Template IO интеграция со store | `src/features/editor/model/use-template-io.ts` (`useTemplateIO`) |
| Persist/Hydrate localStorage | `src/features/editor/model/use-persistence.ts` (`usePersistence`) |
| Tool-утилиты (трансформации, defaults) | `src/features/editor/model/tools.ts` |
| Главный рендер блока (preview) | `src/features/email-preview/ui/BlockRenderer.vue` |
| Рендер row/cell/atom (preview) | `src/features/email-preview/ui/BlockRendererRowNode.vue` |
| Главный рендер блока (export) | `src/features/email-preview/ui/ExportBlockRenderer.vue` |
| Рендер row/cell/atom (export) | `src/features/email-preview/ui/ExportBlockRendererRowNode.vue` |
| HTML-документ экспорта | `src/features/email-preview/ui/EmailExportDocument.vue` |
| Панель настроек блока/атома | `src/features/editor/components/tools/BlockSettingsPanel.vue` |
| Каталог пресетов (JSON-файлы, загрузчик, хелперы) | `src/features/email-preview/catalog/` |
| JSON-схема пресетов | `src/features/email-preview/catalog/block.schema.json` |
| Tree-компоненты (навигация по структуре) | `src/features/editor/components/tree/` |
| Компоненты инструментов (AlignTool, ColorPickerTool, ImageTool, etc.) | `src/features/editor/components/tools/` |
| Shadow DOM хост превью | `src/features/editor/ui/EditorCanvas.vue` |

## 4. Обязательные технические правила

### 4.1 Изменение дерева только через composables

Модель редактора разделена на 4 самостоятельных singleton-composable. Каждый создаётся при первом вызове и переиспользует один экземпляр:

- **`useCanvas()`** — CRUD канваса:
  - Блоки: `insertBlockToCanvas`, `addComponent`, `removeComponent`, `removeComponentById`, `moveComponent`, `duplicateComponent`, `duplicateComponentById`, `clearCanvas`, `renameBlock`.
  - Ряды: `insertRowToBlock`, `insertRowToCell`, `removeRow`.
  - Ячейки: `insertCellToRow`, `removeCell`.
  - Атомы: `insertAtomToCell`, `removeAtom`.
  - Поиск: `findCanvasBlockInstance`, `findRowById`, `findCellById`.
  - Инструменты: `updateToolById`, `updateV2SettingsToolById`, `updateV2AtomToolById`, `addNewToolToMultiTool`, `deleteMultiToolItem`.

- **`useSelection()`** — выделение: `selectBlock`, `selectRow`, `selectCell`, `selectAtom`, `resetSelection`. Computed: `selectedBlock`, `selectedRow`, `selectedCell`, `selectedAtom`. Управление UI: `sidebarActiveTab`, `treeScrollTarget`, `treeScrollRequestId`, `requestTreeScroll`, `openTreeAndScroll`, `selectionLevel`.

- **`useTemplateIO()`** — импорт/экспорт: `importTemplate`, `importTemplateFromJson`, `exportTemplate`, `exportTemplateJson`, `exportTemplateHtml`, `applyImportedTemplate`, `withPersistLock`, `isPersistIgnored`, `triggerPersist`.

- **`usePersistence()`** — localStorage: `persistTemplateToLocalStorage`, `hydrateTemplateFromLocalStorage`, `initTemplatePersistence` (auto-init при создании singleton).

Общее реактивное состояние вынесено в `state.ts`:
- `installed` — `ref<CanvasBlockInstance[]>` — установленные блоки на канвасе.
- `editableId` — `ref<string>` — ID выбранного блока.
- `isDragging` — `ref<boolean>` — состояние перетаскивания.
- `previewMode` — `ref<'desktop' | 'mobile'>` — режим предпросмотра.
- `general` — `reactive<GeneralTool>` — глобальные настройки (padding, background, font, previewText).
- `library` — `shallowRef<BlockLibraryCategory[]>` — категории пресетов с блоками (Menu, Header, Content, Feature, Call to Action, E-Commerce, Footer).
- `templateImportIssues` — `ref<TemplateValidationIssue[]>` — проблемы импорта.

Нельзя напрямую мутировать дерево внутри UI-компонентов.

### 4.2 Shadow DOM и preview-стили

- Хост превью: `src/features/editor/ui/EditorCanvas.vue`.
- Инфра Shadow DOM: `src/shared/lib/shadow-dom.ts`.
- Технические preview-классы должны использовать префикс `p-`.
- Проверять, что стили не протекают за пределы Shadow DOM.

### 4.3 Email-совместимость

- Базовая сетка только через `@mysigmail/vue-email-components` (`MRow`, `MColumn` и т.д.).
- Не строить layout на Flexbox/Grid для email-каркаса.
- Стили критичных элементов задавать inline.

### 4.4 Каталог пресетов

- Блоки-пресеты хранятся как JSON-файлы в `src/features/email-preview/catalog/blocks/`.
- Схема валидации: `src/features/email-preview/catalog/block.schema.json`.
- Загрузка: `load-blocks.ts`, хелперы создания: `composer-helpers.ts`.
- Изображения для пресетов: `images.ts`.
- Сохранение блоков: `save-block.ts`.

### 4.5 Rich Text Editor

- Используется **Tiptap** (на базе ProseMirror) для редактирования текстовых атомов.
- Компоненты текстового редактора: `src/features/editor/components/tools/text/`.
- Подключённые расширения: Bold, Italic, Underline, Color, TextAlign, TextStyle, Link, HardBreak.

## 5. Template contract (нельзя ломать)

Источник: `src/entities/template/types.ts`, `src/entities/template/template-io.ts`.

Обязательные константы/ограничения:
- `TEMPLATE_EXPORT_VERSION = 2`
- `TEMPLATE_LOCAL_STORAGE_KEY = "card.template.v2"`
- `TEMPLATE_MAX_COMPONENTS = 200`
- `TEMPLATE_MAX_JSON_BYTES = 2 * 1024 * 1024`

Скелет экспорта:
```ts
TemplateExportV2 {
  version: 2
  meta: { id, title, createdAt, updatedAt, appVersion? }
  editor: { general: GeneralTool }
  canvas: { components: CanvasBlockInstance[] }
}
```

Поведение:
- Импорт обязан проходить через `parseTemplateExportPayload` / `parseTemplateExportJson`.
- HTML (text editor) должен проходить санитизацию через доменный `template-io`.
- При runtime-импорте id блоков/узлов/атомов ремапятся в новые значения.
- `template-io.ts` содержит полную валидацию всей структуры: `validateAtom`, `validateCellNode`, `validateRowNode`, `validateCanvasBlockInstance`, `validateGeneral`.

## 6. Playbook: типовые изменения

### 6.1 Добавить новый Atom

1. Добавить тип в `src/entities/block/types.ts` (interface + включить в union `Atom` и `AtomType`).
2. Добавить фабрику в `src/entities/block/block-factory.ts`.
3. Поддержать операции в `src/features/editor/model/use-canvas.ts`: ветки в `insertAtomToCell`, `updateV2AtomToolById`.
4. Добавить UI-настройки в `src/features/editor/components/tools/`.
5. Подключить настройки в `src/features/editor/components/tools/BlockSettingsPanel.vue`.
6. Добавить рендер в `src/features/email-preview/ui/BlockRendererRowNode.vue`.
7. Обновить `src/entities/template/template-io.ts`:
   - валидация структуры в `validateAtom`,
   - санитизация,
   - совместимость импорта/экспорта.

### 6.2 Добавить настройку узла (Block/Row/Cell)

1. Добавить поле в соответствующий `*Settings` интерфейс в `src/entities/block/types.ts`.
2. Добавить дефолтное значение в фабрику `src/entities/block/block-factory.ts`.
3. Обновить `updateV2SettingsToolById` в `src/features/editor/model/use-canvas.ts`.
4. Добавить UI-контрол в `src/features/editor/components/tools/BlockSettingsPanel.vue`.
5. Обновить рендеринг в `BlockRenderer.vue` или `BlockRendererRowNode.vue`.
6. Обновить валидацию в `src/entities/template/template-io.ts`.
7. Проверить round-trip (export -> import).

### 6.3 Изменить контракт шаблона

1. Сначала определить обратную совместимость.
2. Затем обновить `types.ts` и `template-io.ts` (validation + migration).
3. После этого обновить feature-layer IO (`src/features/editor/model/use-template-io.ts`) при необходимости.
4. Проверить `append` и `replace` режимы импорта.

### 6.4 Добавить JSON-пресет блока

1. Создать JSON-файл в `src/features/email-preview/catalog/blocks/`.
2. Следовать схеме `block.schema.json`.
3. Зарегистрировать в `load-blocks.ts` в соответствующей категории.
4. Добавить изображение превью в `images.ts`.

## 7. UI policy (shadcn-vue)

- Базовые UI-компоненты размещаются в `src/shared/ui/`.
- Если нужен новый компонент, использовать:
  - `pnpm dlx shadcn-vue@latest add <component_name>`
- Не создавать кастомные аналоги кнопок/инпутов, если есть стандартный shadcn-компонент.
- Shadcn-vue построен на **Reka UI** (бывший Radix Vue).
- CSS: проект использует **Tailwind CSS v4** (подключён через `@tailwindcss/vite`).
- Иконки: **Lucide Vue Next**.

## 8. Проверки перед завершением

Обязательный минимум:
1. Types: `pnpm -s vue-tsc --noEmit`
2. Lint: `pnpm -s eslint <changed_files>`

Smoke-check вручную (критично для этого проекта):
1. Добавление/редактирование нового поля в UI реально меняет превью.
2. Export JSON -> Import JSON дает тот же результат (round-trip).
3. Import в обоих режимах: `replace` и `append`.
4. Перезагрузка страницы восстанавливает состояние из localStorage.
5. В Shadow DOM стили элемента выглядят корректно и не текут наружу.
6. Export HTML повторяет ключевое поведение preview (mobile hide/collapse).

## 9. Антипаттерны (не делать)

- Не создавать новые хранилища состояния мимо `state.ts` и существующих composables.
- Не менять JSON-контракт шаблона без обновления validation/sanitize/migration.
- Не импортировать composables циклически на уровне модуля (использовать call-time вызовы внутри функций).
- Не редактировать `src/types/*.d.ts` вручную — они автогенерируются плагинами `unplugin-auto-import` и `unplugin-vue-components`.
- Не использовать Quill или другие rich-text редакторы — в проекте используется Tiptap.

---
Критерий качества для любого PR: после изменений пользователь может безопасно сохранить шаблон в JSON, импортировать его обратно и получить предсказуемый визуальный результат в email-превью без регрессий структуры.
