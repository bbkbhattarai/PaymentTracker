Task Payment Tracker PWA v12

Upload these files to the root of your GitHub Pages repository:

index.html
manifest.webmanifest
service-worker.js
icon-192.png
icon-512.png
maskable-512.png
apple-touch-icon.png

Allow GitHub to replace the old files, then commit changes.
Open your app link with ?v=10 once, for example:
https://yourusername.github.io/your-repo-name/?v=10

v12 update:
- Improved payment request sending workflow.
- Added Copy email body.
- Added Download .eml email package for Mac/desktop testing.
- Share file now gives clearer fallback behaviour when file attachment is not supported.
- Email draft text now clearly reminds the user to attach the generated file.

Important: browser-based email drafts cannot reliably auto-attach generated files on all devices. Use Share file first on iPhone, or Download file/Print PDF and attach manually.
