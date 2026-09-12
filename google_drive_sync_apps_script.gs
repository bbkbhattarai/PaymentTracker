/**
 * Task Payment Tracker - Google Drive Master JSON Sync Bridge
 * Fixed/easier setup version.
 *
 * What to edit:
 *   1) Change SYNC_KEY below to your own private passphrase.
 *   2) Save.
 *   3) Run testPingFromEditor once to check the script.
 *   4) Deploy as Web app: Execute as Me, Access Anyone with the link.
 */

const MASTER_FILE_NAME = 'task-payment-master.json';

// CHANGE ONLY THE TEXT BETWEEN THE QUOTES BELOW.
// This is singular: SYNC_KEY, not sync_keys.
const SYNC_KEY = 'CHANGE_THIS_TO_A_PRIVATE_SYNC_KEY';

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const callback = params.callback || '';
  try {
    if (!isAuthorised_(params.key)) {
      return output_({ ok: false, error: 'Invalid sync key' }, callback);
    }
    const action = params.action || 'pull';
    if (action === 'ping') {
      return output_({ ok: true, message: 'Task Payment Tracker sync bridge is working', time: new Date().toISOString() }, callback);
    }
    if (action !== 'pull') {
      return output_({ ok: false, error: 'Unsupported action: ' + action }, callback);
    }
    const payload = readMasterPayload_();
    return output_({ ok: true, payload: payload, time: new Date().toISOString() }, callback);
  } catch (err) {
    return output_({ ok: false, error: errorMessage_(err) }, callback);
  }
}

function doPost(e) {
  try {
    const parsed = parsePost_(e);
    if (!isAuthorised_(parsed.key)) {
      return output_({ ok: false, error: 'Invalid sync key' });
    }
    if (parsed.action !== 'push') {
      return output_({ ok: false, error: 'Unsupported action: ' + parsed.action });
    }
    if (!parsed.payload) {
      return output_({ ok: false, error: 'No payload received' });
    }

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
    return output_({ ok: false, error: errorMessage_(err) });
  }
}

/**
 * Run this from the Apps Script editor to test basic setup.
 * Do NOT run doGet/doPost directly from the editor.
 */
function testPingFromEditor() {
  const result = doGet({ parameter: { action: 'ping', key: SYNC_KEY } });
  Logger.log(result.getContent());
}

/**
 * Run this from the Apps Script editor to create/update the master JSON with a tiny sample.
 */
function testPushSampleFromEditor() {
  const samplePayload = {
    app: 'Task Payment Tracker',
    syncFormat: 'complete-device-sync-json',
    exportedAt: new Date().toISOString(),
    tasks: [],
    templates: [],
    settings: { defaultCurrency: 'GBP', mileageRate: '0.45', dueDays: '14' }
  };
  const result = doPost({
    parameter: {},
    postData: { contents: JSON.stringify({ action: 'push', key: SYNC_KEY, payload: samplePayload }) }
  });
  Logger.log(result.getContent());
}

/**
 * Run this after testPushSampleFromEditor to confirm the file can be read.
 */
function testPullSampleFromEditor() {
  const result = doGet({ parameter: { action: 'pull', key: SYNC_KEY } });
  Logger.log(result.getContent());
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
  if (!file) return emptyPayload_();
  const text = file.getBlob().getDataAsString('UTF-8');
  if (!text.trim()) return emptyPayload_();
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

function emptyPayload_() {
  return {
    app: 'Task Payment Tracker',
    syncFormat: 'complete-device-sync-json',
    tasks: [],
    templates: [],
    settings: {},
    exportedAt: new Date().toISOString()
  };
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

function errorMessage_(err) {
  return String(err && err.message ? err.message : err);
}
