Task Payment Tracker PWA v14

Upload these files to the root of your GitHub Pages repository:

index.html
manifest.webmanifest
service-worker.js
icon-192.png
icon-512.png
maskable-512.png
apple-touch-icon.png

Allow GitHub to replace the old files, then commit changes.
Open your app link with ?v=14 once, for example:
https://yourusername.github.io/your-repo-name/?v=14

v14 update:
- Template Builder beta added.
- HTML/TXT templates can be pasted or uploaded and mapped with placeholders.
- DOCX templates can be converted to editable HTML for review when the browser converter loads.
- PDF templates can be saved as overlay templates: the original PDF is kept and fill boxes are placed on top.
- PDF overlay fields can be mapped to app data, fixed text, or editable/ask-each-time placeholders.
- PDF overlay templates generate filled PDF files when using Download file, Share file, or Print/Save PDF.
- Saved custom templates remain part of the full JSON backup/sync.

Notes:
- DOCX/PDF processing uses free browser libraries loaded from CDN, so first use needs internet access.
- Complex Word formatting, text boxes and headers may not convert perfectly. Please review before saving.
- PDF overlay is semi-automatic: the user places and confirms fill boxes manually.
- Browser email drafts still cannot reliably auto-attach files on all devices. Use Share file first on iPhone, or Download file/Print PDF and attach manually.
