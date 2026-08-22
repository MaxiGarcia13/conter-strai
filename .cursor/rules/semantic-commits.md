---
description: Use Conventional Commits when creating or drafting git commit messages
alwaysApply: false
---

# Semantic Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

`feat` → MINOR · `fix` → PATCH · `!` / `BREAKING CHANGE:` → MAJOR · other types → no bump

```
<type>(<optional scope>): <description>
```

- Imperative, lowercase subject, no trailing period, ~72 chars
- Body explains why; split unrelated changes
- Avoid: `update`, `wip`, `fix stuff`, plain prose without a type
