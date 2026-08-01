/**
 * Task Payment Tracker - Google Drive Master JSON Sync Bridge
 *
 * Setup:
 * 1. Go to script.google.com and create a new Apps Script project.
 * 2. Paste this file into Code.gs.
 * 3. Change SYNC_KEY to a private passphrase.
 * 4. Deploy > New deployment > Web app.
 * 5. Execute as: Me. Access: Anyone with the link.
 * 6. Copy the Web App URL into Task Payment Tracker > Export > Cloud master JSON sync beta.
 */

const MASTER_FILE_NAME = 'task-payment-master.json';
const SYNC_KEY = 'CHANGE_THIS_TO_A_PRIVATE_SYNC_KEY';

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const callback = params.callback || '';
  try {
    if (!isAuthorised_(params.key)) return output_({ ok: false, error: 'Invalid sync key' }, callback);
    const action = params.action || 'pull';
    if (action === 'ping') return output_({ ok: true, message: 'Task Payment Tracker sync bridge is working', time: new Date().toISOString() }, callback);
    if (action !== 'pull') return output_({ ok: false, error: 'Unsupported action' }, callback);
    const payload = readMasterPayload_();
    return output_({ ok: true, payload: payload, time: new Date().toISOString() }, callback);
  } catch (err) {
    return output_({ ok: false, error: String(err && err.message ? err.message : err) }, callback);
  }
}

function doPost(e) {
  try {
    const parsed = parsePost_(e);
    if (!isAuthorised_(parsed.key)) return output_({ ok: false, error: 'Invalid sync key' });
    if (parsed.action !== 'push') return output_({ ok: false, error: 'Unsupported action' });
    if (!parsed.payload) return output_({ ok: false, error: 'No payload received' });

    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      const payload = typeof parsed.payload === 'string' ? JSON.parse(parsed.payload) : parsed.payload;
      payload.cloudSavedAt = new Date().toISOString();
      saveMasterPayload_(payload);
      return output_({ ok: true, message: 'Saved master JSON', cloudSavedAt: payload.cloudSavedAt });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return output_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function parsePost_(e) {
  const params = e && e.parameter ? e.parameter : {};
  if (params.payload || params.key || params.action) {
    return { action: params.action || 'push', key: params.key || '', payload: params.payload || '' };
  }
  const text = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
  try {
    return JSON.parse(text);
  } catch (err) {
    return { action: '', key: '', payload: '' };
  }
}

function isAuthorised_(key) {
  return String(key || '') === String(SYNC_KEY || '');
}

function readMasterPayload_() {
  const file = getMasterFile_(false);
  if (!file) return { app: 'Task Payment Tracker', syncFormat: 'complete-device-sync-json', tasks: [], templates: [], settings: {}, exportedAt: new Date().toISOString() };
  const text = file.getBlob().getDataAsString('UTF-8');
  if (!text.trim()) return { app: 'Task Payment Tracker', syncFormat: 'complete-device-sync-json', tasks: [], templates: [], settings: {}, exportedAt: new Date().toISOString() };
  return JSON.parse(text);
}

function saveMasterPayload_(payload) {
  const text = JSON.stringify(payload, null, 2);
  const file = getMasterFile_(true);
  file.setContent(text);
}

function getMasterFile_(createIfMissing) {
  const files = DriveApp.getFilesByName(MASTER_FILE_NAME);
  if (files.hasNext()) return files.next();
  if (!createIfMissing) return null;
  return DriveApp.createFile(MASTER_FILE_NAME, '', MimeType.PLAIN_TEXT);
}

function output_(obj, callback) {
  const safeCallback = String(callback || '').match(/^[A-Za-z_$][A-Za-z0-9_$\.]*$/) ? String(callback) : '';
  if (safeCallback) {
    return ContentService
      .createTextOutput(safeCallback + '(' + JSON.stringify(obj) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
