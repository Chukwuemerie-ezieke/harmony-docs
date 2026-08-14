# Batch queue UI for Merge PDF and Image to PDF

## Scope

Adds a reusable `BatchFileQueue` component for file-order control in the two multi-file creation tools:

- Merge PDF
- Image to PDF

## Capabilities

- Shows the queued files and their exact output position.
- Displays image thumbnails for Image to PDF and PDF indicators for Merge PDF.
- Supports native drag-and-drop reorder, plus move earlier/later buttons for accessibility.
- Allows individual file removal and a one-click Clear all action.
- Passes the visible queue order directly into the existing `mergePDFs` and `imagesToPDF` processing functions.

## Behaviour

The merge and conversion engines are not changed. The interface controls the file array before processing, so the output document follows the order shown in the queue.

## Validation required

Run `npm run check` and `npm run build`. Test at least three PDFs and three images: reorder via drag and buttons, remove one item, clear/re-add files, and confirm output order matches the queue.
