# Native Editing Reference Notes

## Reference Files Reviewed

- `E:\Files\Work\2026-06-30 电厂三期 其他\PPT\PPTist\src\types\slides.ts`
- `E:\Files\Work\2026-06-30 电厂三期 其他\PPT\PPTist\src\configs\element.ts`
- `E:\Files\Work\2026-06-30 电厂三期 其他\PPT\PPTist\src\hooks\useCreateElement.ts`
- `E:\Files\Work\2026-06-30 电厂三期 其他\PPT\PPTist\src\hooks\useMoveElement.ts`
- `E:\Files\Work\2026-06-30 电厂三期 其他\PPT\PPTist\src\hooks\useExport.ts`
- `E:\Files\Work\2026-06-30 电厂三期 其他\PPT\presenton\servers\fastapi\models\presentation_structure_model.py`
- `E:\Files\Work\2026-06-30 电厂三期 其他\PPT\presenton\servers\fastapi\models\presentation_layout.py`
- `E:\Files\Work\2026-06-30 电厂三期 其他\PPT\presenton\servers\fastapi\models\sql\slide.py`
- `E:\Files\Work\2026-06-30 电厂三期 其他\PPT\presenton\servers\fastapi\templates\custom_layout_from_db.py`

## PPTist Decisions To Adopt

- Element operations should be model-first: create, select, move, resize, lock, hide, order, delete, and grouping should mutate slide element data instead of relying on DOM/CSS as the source of truth.
- Native element data should use explicit geometry and type contracts: every editable element needs stable IDs, canvas coordinates, dimensions, rotation where applicable, and type-specific properties.
- Canvas scaling must not change stored element coordinates; display scale and PPT export scale should be conversion layers over the same persisted model.
- Insert defaults should be centralized instead of duplicated in toolbar or editor UI code, including default element sizes, table dimensions, theme colors, text fonts, line styles, and fixed-ratio media behavior.
- Movement should update selected element coordinates directly and then create a history snapshot, preserving predictable undo/redo behavior.
- Export must normalize model data before writing PPTX: colors, opacity, shadows, outlines, text HTML fragments, line points, table widths, and pixel-to-inch/point conversion should be handled explicitly.
- Native export should map element types to PPTX primitives where possible: text to text boxes, images to images, shapes to custom geometry or shapes, lines to line/path primitives, charts to charts, tables to tables, and media to media objects.

## PPTist Decisions Not To Copy Directly

- Do not migrate AIPPT to Vue, Pinia, or PPTist's component architecture.
- Do not import PPTist UI wholesale; port behavior and data principles only.
- Do not copy PPTist's encrypted `.pptist` file format as AIPPT's persistence model.
- Do not assume PPTist's `viewportSize` baseline or pixel-to-inch ratios are automatically correct for AIPPT; AIPPT must define its own slide size and conversion policy.
- Do not directly copy PPTist's HTML text parsing/export behavior without validating it against AIPPT's React/CSS templates and current PPTX/PDF export requirements.
- Do not treat browser screenshot/image PPTX export as native editing parity; it is only a fallback preservation strategy.
- Do not replace current Redux/state persistence or existing template rendering in one step.

## Presenton Compatibility Constraints

- Generated presentation structure currently identifies slides by layout indexes, so native metadata must be additive and must not break existing layout selection.
- `PresentationLayoutModel` and `SlideLayoutModel` are re-exported from the template layer, so native model additions must remain compatible with existing layout payloads.
- Persisted slides store `layout_group`, `layout`, `index`, JSON `content`, optional `html_content`, optional `speaker_note`, and optional JSON `properties`; new native data should live inside existing JSON-compatible fields without invalidating older rows.
- `SlideModel.get_new_slide()` copies layout identity, speaker notes, content, and properties, so native metadata must survive slide duplication without requiring schema migration of core SQL columns.
- Existing custom templates are loaded from database code records and compiled through the Next.js `/api/template/custom` service; native conversion must not bypass or break this custom template compile path.
- Custom template loading expects a payload with `slides` that can instantiate `PresentationLayoutModel`; native capability metadata should be tolerated as additive data rather than replacing the expected layout payload shape.
- Existing PPT import/export and React/CSS rendering paths must remain fallback paths for slides that are not validated as native-capable.

## AIPPT Migration Rule

Native editing is additive. React/CSS templates remain usable until each template reaches accepted native fidelity.

Only enable native editing for a slide when it has a valid versioned native model or an explicitly accepted fallback model. Do not route a deck through native PPTX export if any slide is still legacy-only. Store conversion status, source renderer, and fidelity level with the native model so the UI and export router can distinguish high-fidelity native slides from structured, imported-background, and legacy-only slides.
