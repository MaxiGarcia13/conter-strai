---
description: One React component per file
globs: src/**/*.{tsx,jsx}
alwaysApply: false
---

# One Component Per File

- One React component per file; file name matches kebab-case (`doorway-wall.tsx` → `DoorwayWall`)
- Export the component (and its props type) from that file
- Extract non-component helpers into `hooks/`, `utils/`, or `services/`
- Private plain helpers/constants may stay beside the component
- Tests / Storybook / generated code are exempt
