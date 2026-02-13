# AGENTS

Проект: визуальный email-конструктор на Vue 3 + TypeScript (block composer v2).

## TL;DR для агента

- Работать только с моделью `BlockNode -> RowNode -> CellNode -> Atom`.
- На canvas поддерживаются только блоки `version: 2` (`CanvasBlockInstance`).
- Единый путь рендера: `BlockRenderer.vue` + `BlockRendererRowNode.vue`.
- Единый стор/мутации дерева: `src/store/components/index.ts`.
- Единый импорт/экспорт шаблона: `src/store/components/template-io.ts`.
- Любые изменения структуры должны синхронно обновлять: типы, factory, renderer, tools panel, store, template-io.

---

## 1) Контекст проекта

- Стек: Vue 3 + TypeScript + Vite.
- UI: shadcn-vue компоненты из `src/components/ui/*`.
- Email-рендер: `@mysigmail/vue-email-components`.
- DnD/перестановка блоков: `sortablejs`.
- Санитизация rich text при import/export: `sanitize-html`.

---

## 2) Доменный словарь (обязательный)

- `BlockNode` — корневой узел секции письма.
- `RowNode` — строка layout внутри `BlockNode` или `CellNode`.
- `CellNode` — колонка внутри `RowNode`.
- `Atom` — leaf-сущность контента (`text | button | divider | image | menu`).
- `CanvasBlockInstance` — экземпляр блока на canvas (`id + version + block`).
- `BlockPreset` — пресет для каталога (что можно вставить на canvas).

Правило: суффикс `Node` использовать только для узлов дерева.

---

## 3) Архитектурный контракт

### 3.1 Канвас и дерево

- Канвас хранит только `CanvasBlockInstance[]`.
- Выбор узлов и мутации структуры идут через `useComponentsStore()`.
- Дерево и canvas должны оставаться синхронными по `data-tree-id` / `data-node-id`.

### 3.2 Рендер

- Рендер блоков только через:
  - `src/components/email-components/BlockRenderer.vue`
  - `src/components/email-components/BlockRendererRowNode.vue`
  - `src/components/editor/EditorCanvas.vue` (host превью)
- Не добавлять альтернативные рендер-пайплайны.

### 3.3 Модель и фабрики

- Источник типов:
  - `src/types/block.ts`
  - `src/types/editor.ts`
  - `src/types/template.ts`
  - `src/types/style.ts`
- Создание узлов только через factory:
  - `src/components/email-components/block-factory.ts`
  - `createBlockNode/createRowNode/createCellNode/create*Atom`.

### 3.4 Preset-каталог

- Пресеты: `src/components/email-components/catalog/<category>/*.ts`.
- Регистрация: `src/components/email-components/catalog/<category>/index.ts`.
- Общие helpers: `src/components/email-components/catalog/composer-helpers.ts`.
  - Название файла историческое; использовать как слой shared helpers для preset-сборки.

### 3.5 Import/Export

- Только формат `TEMPLATE_EXPORT_VERSION = 2`.
- IO/валидация/санитизация/ремап id:
  - `src/store/components/template-io.ts`.

---

## 4) Карта источников правды

- Типы узлов: `src/types/block.ts`
- Типы инструментов и canvas-инстанса: `src/types/editor.ts`
- Формат шаблона: `src/types/template.ts`
- Стор редактора и мутации: `src/store/components/index.ts`
- Фабрики узлов/атомов: `src/components/email-components/block-factory.ts`
- Панель инструментов выбранного узла: `src/components/editor/components/tools/BlockSettingsPanel.vue`
- Рендер email-превью: `src/components/editor/EditorCanvas.vue`
- Дерево структуры: `src/components/editor/components/tree/*`

---

## 5) Рабочие сценарии

## 5.1 Добавить/изменить preset

1. Обновить preset-файл в `catalog/<category>/*.ts`.
2. Собрать дерево только через factory/helpers.
3. Для row сначала сбросить базу через helper (`resetRow`), потом накладывать отличия.
4. Зарегистрировать preset в `catalog/<category>/index.ts`.
5. Проверить вставку в canvas + рендер + редактирование в tools.

## 5.2 Изменение структуры узла (row/cell/block settings)

1. Обновить `src/types/block.ts`.
2. Обновить default values в `block-factory.ts`.
3. Обновить рендер в `BlockRenderer*.vue`.
4. Обновить `BlockSettingsPanel.vue`.
5. Обновить обновление значений в store (`updateV2SettingsToolById` и соседние).
6. Обновить `template-io.ts` (валидация/санитизация/remap).

## 5.3 Добавить новый atom type

1. Добавить тип в `src/types/block.ts` (`AtomType`, union `Atom`).
2. Добавить фабрику в `block-factory.ts`.
3. Добавить рендер ветку в `BlockRendererRowNode.vue`.
4. Добавить UI редактирования в `BlockSettingsPanel.vue`.
5. Добавить операции в store, если нужны новые поля.
6. Обновить `template-io.ts` (validate/sanitize/remap).

## 5.4 Изменение инструментов

- Инструменты описаны в `src/types/editor.ts`.
- Для колонок использовать `type: 'columns'` и `ColumnCollectionTool`.
- Новые tool-типы должны быть отражены в:
  - `EditorComponentTools.vue`
  - `template-io.ts` (`TOOL_TYPES`, validate/sanitize/remap)
  - store update-обработчиках.

---

## 6) Tree-first UX (инварианты)

- Структурные операции в первую очередь поддерживать через дерево (`tree/*`).
- Клик из дерева не должен принудительно скроллить canvas.
- Клик из canvas может активировать вкладку дерева и прокручивать к узлу.
- Идентификаторы узлов:
  - `block:<id>`
  - `row:<id>`
  - `cell:<id>`
  - `atom:<id>`

---

## 7) Валидность email HTML (критично)

- Не ломать email-совместимость ради web-only удобств.
- Предпочитать табличный/layout-подход через `@mysigmail/vue-email-components`.
- Стили должны оставаться консервативными и совместимыми с email-клиентами.
- Rich text должен проходить санитизацию в import/export.

---

## 8) UI policy (shadcn-first)

Порядок:
1. Проверить готовый компонент в `src/components/ui/*`.
2. Если нет — добавить через `shadcn-vue`.
3. Если нет в shadcn-vue — сделать локальную обертку в стиле существующих `ui/*`.

Не дублировать существующие UI-компоненты под новыми именами.

Команда установки shadcn-компонента:
- `pnpm dlx shadcn-vue@latest add <component>`

---

## 9) Shadow DOM и preview-стили

- Preview рендерится в Shadow DOM:
  - `src/components/editor/TheEditor.vue`
  - `src/utils/index.ts` (`renderToShadowDom`)
- Технические классы превью должны быть с префиксом `p-`.
- Стили preview и `p-*` держать в:
  - `src/assets/css/preview.css`

---

## 10) Telemetry

- Телеметрия изолирована в `src/services/telemetry/*`.
- Не менять telemetry-код в задачах редактора без явного запроса.

---

## 11) Проверки перед завершением задачи

- Типы:
  - `pnpm -s vue-tsc --noEmit --skipLibCheck`
- Линт по измененным файлам:
  - `pnpm -s eslint <changed-files>`

Опционально (если менялись авто-импорты/глобальные компоненты):
- `pnpm -s vite build`

---

## 12) Что не трогать без причины

- Автогенерируемые декларации:
  - `src/types/auto-imports.d.ts`
  - `src/types/components.d.ts`
- Ambient declarations:
  - `src/env.d.ts`
  - `src/types/extensions.d.ts`

Не редактировать эти файлы вручную.

---

## 13) Формат и стиль изменений

- Делать небольшие изолированные патчи.
- Избегать архитектурных отклонений без явной причины.
- При архитектурном решении документировать ограничения и компромиссы.
- Для рефакторинга нейминга проходить полный контур:
  - типы -> фабрики -> рендер -> store -> template-io -> каталог -> проверки.
