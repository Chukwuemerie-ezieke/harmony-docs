🔒 Prevent command injection in HarmonyDocs PDF endpoints

* 🎯 **What:** The command injection vulnerability in PDF unlock, protect, and HTML-to-PDF endpoints has been fixed.
* ⚠️ **Risk:** Shell command construction allowed a user-supplied password to be interpreted by the operating system shell, which could enable arbitrary server-side command execution.
* 🛡️ **Solution:** Used `execFileSync` with structured argument arrays and shell disabled, plus minimal server-side password validation (checking that the password is a string and length is between 1 and 1024 characters).
* **Scope:** `/api/unlock`, `/api/protect`, and `/api/html-to-pdf`.
* **Verification:**
  * Manual verification process documented as standard tests fail due to missing ESM mocking infrastructure for `child_process`.
  * Pre-existing frontend TS errors still exist and were not modified (in `client/src/components/layout.tsx` and `client/src/hooks/use-theme.ts` resulting in `npm run build` and `npm run check` failures).
* **Remaining note:** This removes shell injection; it does not replace the separate planned async/non-blocking performance work.
