const KEYS = {
  PROFILE: "tarot_user_profile",
  READINGS: "tarot_user_readings",
  FEEDBACK: "tarot_user_feedback",
  SUPPLEMENTAL: "tarot_user_feedback_records",
};

function read(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function write(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

/* ---- Profile ---- */

export function getProfile() {
  return read(KEYS.PROFILE);
}

export function saveProfile({ nickname }) {
  const profile = { nickname, createdAt: new Date().toISOString() };
  write(KEYS.PROFILE, profile);
  return profile;
}

export function clearProfile() {
  localStorage.removeItem(KEYS.PROFILE);
}

/* ---- Readings ---- */

export function getReadings() {
  return read(KEYS.READINGS) || [];
}

export function saveReading(reading) {
  const readings = getReadings();
  readings.unshift({ ...reading, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
  write(KEYS.READINGS, readings);
  return readings;
}

/* ---- Feedback ---- */

export function getFeedbackRecords() {
  return read(KEYS.FEEDBACK) || [];
}

export function saveFeedback(record) {
  const records = getFeedbackRecords();
  records.unshift({ ...record, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
  write(KEYS.FEEDBACK, records);
  return records;
}

export function updateLastFeedback(feedbackText) {
  const records = getFeedbackRecords();
  if (records.length > 0) {
    records[0].feedbackText = feedbackText;
    write(KEYS.FEEDBACK, records);
  }
}

/* ---- Legacy localStorage compatibility (from the old feedback system) ---- */

export function loadLegacyFeedback() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.SUPPLEMENTAL) || "[]");
  } catch {
    return [];
  }
}
