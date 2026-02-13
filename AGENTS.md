# AGENTS

Этот документ описывает, как агенту безопасно менять код в проекте email-конструктора на Vue 3 + TypeScript.
Главный принцип: **JSON-структура шаблона первична**, HTML-превью вторично.

## 0. Приоритеты изменений

Перед любым изменением соблюдай порядок:
1. Сохранить контракт данных шаблона (`version`, структура, лимиты, санитизация).
2. Не ломать инварианты дерева `Block -> Row -> Cell -> Atom`.
3. Не нарушать email-совместимость (табличная верстка, inline-стили).
4. Не ломать UX редактора (выделение, дерево, импорт/экспорт, localStorage).

## 1. Архитектурная карта (FSD-lite)

- `src/app` — инициализация приложения, глобальные стили.
- `src/entities` — доменные сущности и бизнес-логика (`block`, `style`, `template`).
- `src/features` — фичи редактора и превью (`editor`, `email-preview`).
- `src/shared` — общие UI-компоненты, утилиты, инфраструктура.

## 2. Доменная модель и инварианты

Базовая иерархия:
`BlockNode` -> `RowNode` -> `CellNode` -> `Atom`.

Ключевые сущности:
- `BlockNode` содержит `rows`.
- `RowNode` содержит `cells`.
- `CellNode` содержит `atoms` и `rows` (вложенность поддерживается рекурсивно).
- `Atom` — контентный узел (`text`, `button`, `divider`, `image`, `menu`).
- `CanvasBlockInstance` — элемент канваса с `id`, `version: 2`, `block`.

ID-правила:
- В данных узлов хранятся "сырые" id (`nanoid(8)`), без префиксов.
- Префиксы `block:`, `row:`, `cell:`, `atom:` используются в UI (`data-node-id`, tree scroll target), а не в persisted-данных.

## 3. Source of Truth (куда идти за изменениями)

| Что меняем | Файл |
| :--- | :--- |
| Типы дерева блока | `src/entities/block/types.ts` |
| Фабрики узлов/атомов | `src/entities/block/block-factory.ts` |
| Типы spacing/background | `src/entities/style/types.ts` |
| Контракт шаблона (`TemplateExportV2`, лимиты, tool types) | `src/entities/template/types.ts` |
| Валидация/санитизация/migration/remap id шаблона | `src/entities/template/template-io.ts` |
| Store API редактора | `src/features/editor/model/index.ts` |
| CRUD дерева на канвасе | `src/features/editor/model/canvas.ts` |
| Template IO интеграция со store | `src/features/editor/model/template-io.ts` |
| Persist/Hydrate localStorage | `src/features/editor/model/persistence.ts` |
| Главный рендер блока | `src/features/email-preview/ui/BlockRenderer.vue` |
| Рендер row/cell/atom | `src/features/email-preview/ui/BlockRendererRowNode.vue` |
| Панель настроек блока/атома | `src/features/editor/components/tools/BlockSettingsPanel.vue` |
| Каталог пресетов | `src/features/email-preview/catalog/` |

Важно:
- В проекте **два `template-io.ts`** с разной ответственностью:
  - `src/entities/template/template-io.ts` — доменный парсер/валидатор/санитайзер.
  - `src/features/editor/model/template-io.ts` — применение шаблона к store.

## 4. Обязательные технические правила

### 4.1 Изменение дерева только через store

Использовать `useComponentsStore` и его API:
- `insertBlockToCanvas`, `insertRowToBlock`, `insertRowToCell`
- `insertCellToRow`, `insertAtomToCell`
- `removeComponent`, `removeRow`, `removeCell`, `removeAtom`
- `moveComponent`, `moveAtomWithinCell`
- `updateToolById`, `addNewToolToMultiTool`, `deleteMultiToolItem`
- `selectBlock/selectRow/selectCell/selectAtom`

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

## 5. Template contract (нельзя ломать)

Источник: `src/entities/template/types.ts`, `src/entities/template/template-io.ts`.

Обязательные константы/ограничения:
- `TEMPLATE_EXPORT_VERSION = 2`
- `TEMPLATE_LOCAL_STORAGE_KEY = "card.template.v2"`
- `TEMPLATE_MAX_COMPONENTS = 200`
- `TEMPLATE_MAX_JSON_BYTES = 2 * 1024 * 1024`

Поведение:
- Импорт обязан проходить через `parseTemplateExportPayload` / `parseTemplateExportJson`.
- HTML (text editor) должен проходить санитизацию через доменный `template-io`.
- При runtime-импорте id блоков/узлов/атомов ремапятся в новые значения.

## 6. Playbook: типовые изменения

### 6.1 Добавить новый Atom

1. Добавить тип в `src/entities/block/types.ts`.
2. Добавить фабрику в `src/entities/block/block-factory.ts`.
3. Поддержать операции в `src/features/editor/model/canvas.ts` (если нужны спец-ветки).
4. Добавить UI-настройки в `src/features/editor/components/tools/`.
5. Подключить настройки в `src/features/editor/components/tools/BlockSettingsPanel.vue`.
6. Добавить рендер в `src/features/email-preview/ui/BlockRendererRowNode.vue`.
7. Обновить `src/entities/template/template-io.ts`:
   - валидация структуры,
   - санитизация,
   - совместимость импорта/экспорта.

### 6.2 Добавить новый тип Tool / поле настройки

1. Добавить типы в `src/entities/template/types.ts`.
2. Обновить трансформации в `src/features/editor/model/tools.ts` и `canvas.ts`.
3. Обновить UI панели настроек (`tools/*`, `BlockSettingsPanel.vue`).
4. Обновить доменный IO (`src/entities/template/template-io.ts`):
   - разрешенный `TOOL_TYPES`,
   - валидация/санитизация value.
5. Проверить, что поле сохраняется в JSON и восстанавливается из localStorage.

### 6.3 Изменить контракт шаблона

1. Сначала определить обратную совместимость.
2. Затем обновить `types.ts` и `template-io.ts` (validation + migration).
3. После этого обновить feature-layer IO (`src/features/editor/model/template-io.ts`) при необходимости.
4. Проверить `append` и `replace` режимы импорта.

## 7. UI policy (shadcn-vue)

- Базовые UI-компоненты размещаются в `src/shared/ui/`.
- Если нужен новый компонент, использовать:
  - `pnpm dlx shadcn-vue@latest add <component_name>`
- Не создавать кастомные аналоги кнопок/инпутов, если есть стандартный shadcn-компонент.

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

## 9. Антипаттерны (не делать)

- Не добавлять новые точки входа для состояния мимо `useComponentsStore`.
- Не менять JSON-контракт шаблона без обновления validation/sanitize/migration.

---
Критерий качества для любого PR: после изменений пользователь может безопасно сохранить шаблон в JSON, импортировать его обратно и получить предсказуемый визуальный результат в email-превью без регрессий структуры.
