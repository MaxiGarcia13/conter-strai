---
description: Diagnose before coding; ask when stuck; no speculative fix thrash
alwaysApply: true
---

# Diagnose Before Changing

Save the user’s tokens. Do not ship speculative “fixes” when the bug is still unconfirmed.

## Always

- **Reproduce / locate first** — name the exact trigger, file, and mechanism (with evidence: log, stack, LOD input, mount/unmount) before editing
- **One hypothesis, one change** — if it fails, stop and ask; do not stack A→B→C patches in the same breath
- **Ask early** when evidence is missing (what they see, when it happens, console output, expected vs actual)
- Prefer a **short question** over another untested code pass

## Forbid

- Changing code “just to try something” without a confirmed root cause
- Broad refactors or new abstractions while debugging a single symptom
- Claiming fixed without a clear before/after mechanism the user can verify
- Repeating the same class of fix after the user says it still happens

## When the user says it still happens

1. Acknowledge; do **not** immediately edit more files
2. Ask for the minimum signal needed (trigger steps + what unmounts/lags)
3. Only then propose **one** targeted change (or say you need a trace)
