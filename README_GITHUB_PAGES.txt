Task Payment Tracker PWA v18 - flat upload

Upload these files to your GitHub repository root:

index.html
manifest.webmanifest
service-worker.js
icon-192.png
icon-512.png
maskable-512.png
apple-touch-icon.png

Optional but useful to keep in the repo for your own reference:

google_drive_sync_apps_script.gs
GOOGLE_DRIVE_SYNC_SETUP.txt
README_GITHUB_PAGES.txt
README_GITHUB_PAGES_NO_FOLDER.txt

After upload, open your GitHub Pages link with ?v=18 at the end once, for example:
https://yourusername.github.io/your-repo-name/?v=18

v18 adds:
- 1-hour default grace period for status alerts after scheduled task end time
- App-open alerts with direct action buttons: mark completed, reschedule, request pay, open form/link, mark paid, or view task
- Flexible payment request actions per task: email draft, PDF/document, form/link, or any combination
- Optional payment/request form link field, including {{placeholder}} replacement before opening
- Extra custom fields for form links, entered as key = value lines
- Smart autofill from previous matching client/contact/email/location records
- New Stats tab with filters for this week, this month, app year Apr-Mar, last 30/90 days and custom range
- Stats summary cards, task status chart, client amount chart, paid trend chart and detailed client table
- PWA cache updated to v18

If the iPhone Home Screen app still loads an old version, remove the old Home Screen icon, open the ?v=18 link in Safari, refresh once, and add it to Home Screen again.
