# Handler Composition

Compose actions across hooks and leaves without hidden wiring. Do not thread the same function through many hooks or components only to re-export or rename it (`toggleX` / `onToggleX` / `handleX`). That makes errors hard to track and forces the same signature to be copy-pasted across options bags and prop lists.

## Forbid

- Multi-hop pass-through of the same callback with renames at each boundary
- Copy-pasting identical callback signatures across many props / options interfaces
- Pass-through-only props on intermediate components when a store or shared type already owns the action
- `*.getState()` on gallery chrome stores (session / location / map / messages; pre-split `gallery-session-ui-store`) — imperative snapshots bypass React subscriptions and are hard to follow
- **Camera / step / roam refs in Zustand** — no gallery store holds `lookOffsetRef` / `roam*Ref` / `pickPointRef`, `createStepStore`, per-frame collision/enabled refs, or camera state. Stores are low-frequency chrome truth only; hot-path state stays in refs / the step store outside Zustand
- **Late-bound composition refs** — stub `useRef(() => {})` / `useRef(null)`, pass the ref into hook A, then assign `ref.current = hookB.fn` (or a child fills it during render) so A can call B defined later. Silent no-ops, mount-order bugs, and hidden cycles. Examples not to add: `enterRoamRef`, `enterFirstRoomRoamRef`, `introApiRef`
- Callback-ref mirroring: `const onXRef = useRef(onX); onXRef.current = onX` (or the same via `useEffect`) just to call `onXRef.current()` from an effect / frame loop
- **Session / prop field mirroring into refs** — `const modeRef = useRef(mode); modeRef.current = mode` (same for `roamRoomId`, `approached`, …) then read `modeRef.current` in a handler. Use the value directly and list it in `useCallback` / effect deps (or `useEffectEvent` when the listener is effect-bound in the same hook). Do not invent a ref to “stay fresh”

## Prefer

- Gallery chrome stores for shared UI state and thin mutations (session / location / map / messages — see Store boundaries)
- In React: `useGalleryLocationStore((state) => state.leaveApproach)` (or other store selectors)
- **Store boundaries (Phase 30):** one concern per gallery chrome store — `session` (`active` / `setActive`), `location` (`mode`, `currentRoomId`, approach fields + `enterRoam` / `resetToThreshold` / approach actions + `selectRoamRoomId`), `map` (`mapOpen` + open/close), `messages` (HUD copy: status eyebrow, roam/approach hints, room-intro payload). Sky stays in `gallery-sky-store`. No store owns camera / step / roam state (see Forbid). **Map mutates location only** via `enterRoam` — it never owns room identity. Messages has one writer per kind (intro show/dismiss from navigation/host; hints/eyebrow from location selectors or a single owner)
- **DOM / store listeners in `useEffect` that need the latest callback:** `useEffectEvent` (React 19), called only from that effect (or another Effect Event) in the **same** component — do not assign it to a variable or pass it through a refs bag / child hook
- **`useFrame` / tween helpers:** pass the plain `on*` prop through; R3F keeps the latest frame callback, and tween `useEffect`s list `onTweenChange` in deps. Do not wrap those in `useEffectEvent` just to put them on a shared refs object (eslint forbids passing Effect Events down)
- Close over `mode` / `roamRoomId` / `approached` (etc.) in handlers; put them in deps so binders re-subscribe when they change
- One shared handler type imported everywhere (e.g. `ToggleApproachHandler`)
- Adapters at the input edge (`bindStepInputs`, `bindPointerLook`, `bindRoamMove`) take `on*` from the React owner; put handlers in effect deps (or `useEffectEvent` in the same hook) — do not mirror every handler into a ref bag
- Orchestration stays in one owner hook; leaves select store actions themselves — do not drill them through Walk → Canvas → Corridor
- Intermediate components share one props type (or spread) — do not redeclare identical callback lists
- **Hook cycles:** invert ownership (listener lives where the handler exists), or a small module channel (`request*` / `subscribe*` / `consume*`, like pick-signal / room-intro channels) — not stub refs assigned later in the owner

## Allow

- Genuine composition where the parent owns behavior the child cannot see (pass a real callback from an already-created hook — not a stub filled later)
- Per-frame refs (`lookOffsetRef`, roam position/move refs, collision/enabled refs read from `useFrame`, etc.) as documented hot-path bridges — sync those during render when `useFrame` reads them the same frame; do not move those into React state or any gallery chrome store
- Non-React bootstrap that must read another store (e.g. sky clock) may use that store’s `getState()` — not the gallery chrome stores

## Exemplar

Walk / roam cleanup: `specs/tech-debt.md` Phase TD16. Keep orchestration (`toggleApproach`, doorway leave, step, intro, tween ref) out of the gallery chrome stores; do not expand any of them (or the pre-split `gallery-session-ui-store`) into a god-object.
