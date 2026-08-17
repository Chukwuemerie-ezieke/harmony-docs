# Production build repair: missing theme module

## Root cause

`client/src/lib/theme.ts` was created in exactly one commit (`4ae7fc177f020ec5dbf5f0472fcf5b29847edef9`) and was never modified again through the last two successful production deployments (PR #21 merge `d13a44f2`, PR #22 merge `c5c255c2`), confirmed via `git log --follow -- client/src/lib/theme.ts` against those commits.

A later revert (PR #28, intended to undo an unrelated destructive commit) deleted this file as "orphaned," without accounting for the fact that Jules had since built new consumers on top of it in PR #22: `client/src/hooks/use-theme.ts` (new file) plus updates to `client/src/components/layout.tsx` and `client/src/components/pdf-export-controls.tsx`. Every deployment since the revert failed at Vite/PWA build time with:

```
[vite-plugin-pwa:build] Could not load /vercel/path0/client/src/lib/theme (imported by client/src/hooks/use-theme.ts): ENOENT
```

## Fix

Restore `client/src/lib/theme.ts` with its exact original content, unchanged since creation and proven compatible with every consumer currently on `main` because no commit ever modified it while those consumers were built and successfully deployed against it.

No other files were changed in this repair.

## Verification

A Vercel preview build must be confirmed green for this branch before merging into `main`.
