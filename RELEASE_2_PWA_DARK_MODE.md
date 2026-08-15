# PWA installation and dark mode

## PWA support

HarmonyDocs now includes a web app manifest, service worker registration in production, install metadata, and an install button that appears when the browser makes an install prompt available.

The service worker caches only same-origin app-shell resources requested with GET (documents, scripts, styles, images, and fonts). It does not cache POST requests, user-selected files, generated PDFs, passwords, or API responses. This preserves the privacy model for document processing.

Before launch, add real branded PNG icons at:

- `client/public/icons/icon-192.png`
- `client/public/icons/icon-512.png`

The manifest references those paths; installation quality checks will require them.

## Dark mode

A theme helper persists the user’s selected light/dark mode in local storage and uses the operating-system preference when no selection is saved. A `ThemeToggle` component is provided for placement in the shared app header.

## Required integration and validation

1. Import `ThemeToggle`, initialize theme state with `getPreferredTheme`, call `applyTheme`, and place the control in the app’s shared header in `client/src/App.tsx`.
2. Ensure the existing Tailwind theme exposes dark token values; do not replace global styles without preserving existing CSS variables.
3. Add the two icon files listed above before merging.
4. Run `npm run check` and `npm run build`.
5. Test Android Chrome installation, iOS Add to Home Screen, standalone launch, light/dark persistence, OS-preference fallback, and that no uploaded/generated document appears in Cache Storage.
