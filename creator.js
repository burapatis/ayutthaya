const DRAFT_KEY = 'ayutthaya-creator-drafts-v2';
const LEGACY_DRAFT_KEY = 'ayutthaya-drafts';
const PUBLIC_DATA_URL = 'data/content.json?v=creator-simple-20260826';
const READY_STATUS = 'พร้อมเผยแพร่';
let editingDraftId = null;

const $ = (selector) => document.querySelector(selector);
const form = $('#draft-form');
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));

function parseDraftStorage(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
}

function readDrafts() {
  const merged = [...parseDraftStorage(DRAFT_KEY), ...parseDraftStorage(LEGACY_DRAFT_KEY)];
  const unique = new Map();
  merged.forEach((draft) => { if (draft && draft.id && !unique.has(draft.id)) unique.set(draft.id, draft); });
  return [...unique.values()];
}

function writeDrafts(drafts) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
}

function formValue(name) {
  return String(form.elements[name]?.value || '').trim();
}

function setFormValue(name, value = '') {
  if (form.elements[name]) form.elements[name].value = value;
}

function resetForm() {
  editingDraftId = null;
  form.reset();
  setFormValue('type', 'เรื่องเล่า');
  setFormValue('status', 'Draft');
  setFormValue('category', 'ร่างข้อมูล');
  $('#save-draft').textContent = 'บันทึกข้อมูลในอุปกรณ์นี้';
  $('#form-mode-help').textContent = 'กรอกข้อมูลที่มีแหล่งที่มา แล้วบันทึกเป็นร่าง ข้อมูลจะยังไม่ขึ้นเว็บไซต์สาธารณะ';
}

function loadDraftIntoForm(draft) {
  editingDraftId = draft.id;
  ['title', 'type', 'status', 'category', 'summary', 'detail', 'location', 'image', 'altText', 'sourceLabel', 'sourceUrl', 'sourceNote', 'updated'].forEach((name) => setFormValue(name, draft[name] || ''));
  $('#save-draft').textContent = 'บันทึกการแก้ไข';
  $('#form-mode-help').textContent = `กำลังแก้ไข “${draft.title || 'ร่างข้อมูล'}” ข้อมูลยังอยู่ในอุปกรณ์นี้เท่านั้น`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function draftFromForm(existing = {}) {
  return {
    ...existing,
    id: existing.id || `draft-${Date.now()}`,
    title: formValue('title'),
    type: formValue('type') || 'เรื่องเล่า',
    category: formValue('category') || 'ร่างข้อมูล',
    summary: formValue('summary'),
    detail: formValue('detail'),
    location: formValue('location') || 'ยังไม่ระบุ',
    image: formValue('image'),
    altText: formValue('altText'),
    sourceLabel: formValue('sourceLabel'),
    sourceUrl: formValue('sourceUrl'),
    sourceNote: formValue('sourceNote'),
    status: formValue('status') || 'Draft',
    updated: formValue('updated') || 'ยังไม่ระบุ',
    visibility: 'private',
    accent: existing.accent || 'art-urban',
    featured: Boolean(existing.featured)
  };
}

function saveDraft(event) {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const drafts = readDrafts();
  const existing = drafts.find((draft) => draft.id === editingDraftId) || {};
  const draft = draftFromForm(existing);
  const next = editingDraftId ? drafts.map((item) => item.id === editingDraftId ? draft : item) : [draft, ...drafts];
  writeDrafts(next);
  renderDrafts();
  showMessage(editingDraftId ? 'บันทึกการแก้ไขแล้ว' : 'บันทึกร่างไว้ในอุปกรณ์แล้ว');
  resetForm();
}

function statusClass(status = 'Draft') {
  const classes = { Draft: 'draft', Review: 'review', 'Needs Update': 'needs-update', [READY_STATUS]: 'ready', Archived: 'archived' };
  return classes[status] || 'draft';
}

function renderDrafts() {
  const drafts = readDrafts();
  $('#draft-count').textContent = String(drafts.length).padStart(2, '0');
  $('#ready-count').textContent = String(drafts.filter((draft) => draft.status === READY_STATUS).length).padStart(2, '0');
  if (!drafts.length) {
    $('#draft-list').innerHTML = '<div class="draft-empty"><strong>ยังไม่มีร่างข้อมูล</strong><span>ร่างที่บันทึกจากแบบฟอร์มจะปรากฏตรงนี้</span></div>';
    return;
  }
  $('#draft-list').innerHTML = drafts.map((draft) => `<article class="draft-item"><div class="draft-item-main"><span class="status-pill status-${statusClass(draft.status)}">${escapeHtml(draft.status || 'Draft')}</span><h3>${escapeHtml(draft.title || 'ยังไม่มีชื่อเรื่อง')}</h3><p>${escapeHtml(draft.type || 'ยังไม่ระบุ')} · ${escapeHtml(draft.updated || 'ยังไม่ระบุ')}</p></div><div class="draft-actions"><button type="button" class="draft-edit" data-edit-draft="${escapeHtml(draft.id)}">แก้ไข</button><button type="button" class="draft-publish" data-publish-draft="${escapeHtml(draft.id)}">เตรียมเผยแพร่</button><button type="button" class="draft-delete" data-delete-draft="${escapeHtml(draft.id)}">ลบ</button></div></article>`).join('');
}

function handleDraftAction(event) {
  const button = event.target.closest('button[data-edit-draft], button[data-publish-draft], button[data-delete-draft]');
  if (!button) return;
  const id = button.dataset.editDraft || button.dataset.publishDraft || button.dataset.deleteDraft;
  const drafts = readDrafts();
  const draft = drafts.find((item) => item.id === id);
  if (!draft) return;
  if (button.dataset.editDraft) loadDraftIntoForm(draft);
  if (button.dataset.publishDraft) {
    writeDrafts(drafts.map((item) => item.id === id ? { ...item, status: READY_STATUS } : item));
    renderDrafts();
    showBackupMessage('เตรียมรายการสำหรับเผยแพร่แล้ว กรุณาดาวน์โหลดไฟล์รายการพร้อมเผยแพร่');
  }
  if (button.dataset.deleteDraft && window.confirm(`ต้องการลบร่าง “${draft.title || 'ไม่มีชื่อเรื่อง'}” หรือไม่`)) {
    writeDrafts(drafts.filter((item) => item.id !== id));
    renderDrafts();
    showMessage('ลบร่างข้อมูลแล้ว');
  }
}

async function loadPublishedCount() {
  try {
    const response = await fetch(PUBLIC_DATA_URL);
    if (!response.ok) throw new Error('Content unavailable');
    const records = await response.json();
    $('#published-count').textContent = String(records.filter((item) => item.visibility !== 'private' && !item.isDraft).length).padStart(2, '0');
  } catch (error) {
    $('#published-count').textContent = '—';
  }
}

function suggestDraftStructure() {
  const prompt = $('#ai-prompt').value.trim() || 'เรื่องเล่าอยุธยา';
  $('#ai-result').innerHTML = `<strong>โครงร่างแนะนำจากคำสั่งของคุณ</strong><ol><li>ประเด็นสำคัญที่ผู้อ่านควรรู้จาก “${escapeHtml(prompt)}”</li><li>บริบทของพื้นที่ วัตถุ หรือการใช้งานในปัจจุบัน</li><li>ข้อมูลที่ผู้ใช้ต้องใช้จริง เช่น เวลาเข้าถึง การเดินทาง หรือข้อควรทราบ</li><li>รายการแหล่งอ้างอิงและประเด็นที่ยังต้องตรวจสอบ</li><li>คำบรรยายภาพและ Alt Text โดยไม่ระบุข้อมูลส่วนบุคคล</li></ol><span class="ai-disclaimer">นี่เป็นโครงร่างตัวอย่าง ไม่ใช่ข้อเท็จจริงที่พร้อมเผยแพร่</span>`;
}

function buildAiPrompt() {
  const title = formValue('title') || 'เรื่องใหม่เกี่ยวกับอยุธยา';
  return `ช่วยจัดทำร่างข้อมูลสำหรับเว็บไซต์ “อยุธยาของเรา”\n\nชื่อเรื่อง: ${title}\nประเภท: ${formValue('type')}\nหมวดหมู่: ${formValue('category')}\nสรุปตั้งต้น: ${formValue('summary')}\nรายละเอียดตั้งต้น: ${formValue('detail')}\nพื้นที่: ${formValue('location')}\nแหล่งอ้างอิง: ${formValue('sourceLabel')} ${formValue('sourceUrl')}\n\nข้อกำหนด: ใช้เฉพาะข้อเท็จจริงที่มีแหล่งอ้างอิง แยกข้อเท็จจริงกับข้อสันนิษฐาน ระบุสิ่งที่ต้องตรวจสอบเพิ่มเติม ไม่กล่าวถึงบุคคลหรือข้อมูลส่วนบุคคล และเสนอ SEO title, meta description, Alt Text และคำค้นที่เหมาะสม`;
}

async function copyAiPrompt() {
  const prompt = buildAiPrompt();
  $('#ai-prompt').value = prompt;
  try {
    await navigator.clipboard.writeText(prompt);
    showMessage('คัดลอกคำสั่ง AI แล้ว ให้นำไปใช้ใน ChatGPT ได้เลย');
  } catch (error) {
    $('#ai-prompt').focus();
    $('#ai-prompt').select();
    showMessage('เลือกคำสั่ง AI ไว้แล้ว กดคัดลอกด้วยตนเองได้เลย');
  }
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportBackup() {
  downloadJson(`ayutthaya-creator-backup-${new Date().toISOString().slice(0, 10)}.json`, { version: 2, exportedAt: new Date().toISOString(), drafts: readDrafts() });
  showBackupMessage('ดาวน์โหลดไฟล์สำรองแล้ว');
}

function exportPublishPackage() {
  const ready = readDrafts().filter((draft) => draft.status === READY_STATUS).map((draft) => ({ ...draft, visibility: 'public', status: 'รอตรวจสอบก่อนเผยแพร่' }));
  if (!ready.length) {
    showBackupMessage('ยังไม่มีรายการที่เลือก “พร้อมเผยแพร่”');
    return;
  }
  downloadJson(`ayutthaya-ready-to-publish-${new Date().toISOString().slice(0, 10)}.json`, { version: 1, exportedAt: new Date().toISOString(), note: 'ไฟล์นี้เป็นชุดข้อมูลรอตรวจสอบ ไม่ได้เผยแพร่อัตโนมัติ', records: ready });
  showBackupMessage(`ดาวน์โหลด ${ready.length} รายการพร้อมเผยแพร่แล้ว`);
}

async function importBackup(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const imported = Array.isArray(parsed) ? parsed : parsed.drafts;
    if (!Array.isArray(imported)) throw new Error('Invalid backup');
    const valid = imported.filter((draft) => draft && draft.id && draft.title).map((draft) => ({ ...draft, visibility: 'private' }));
    if (!valid.length) throw new Error('No drafts');
    const current = readDrafts();
    const byId = new Map([...current, ...valid].map((draft) => [draft.id, draft]));
    writeDrafts([...byId.values()]);
    renderDrafts();
    showBackupMessage(`นำเข้าข้อมูลสำรองแล้ว ${valid.length} รายการ`);
  } catch (error) {
    showBackupMessage('ไม่สามารถนำเข้าไฟล์นี้ได้ กรุณาใช้ไฟล์สำรองของเว็บไซต์');
  }
  event.target.value = '';
}

function showMessage(message) {
  const element = $('#save-message');
  element.textContent = message;
  element.hidden = false;
  window.setTimeout(() => { element.hidden = true; }, 3200);
}

function showBackupMessage(message) {
  const element = $('#backup-message');
  element.textContent = message;
  element.hidden = false;
  window.setTimeout(() => { element.hidden = true; }, 4200);
}

form.addEventListener('submit', saveDraft);
$('#reset-draft').addEventListener('click', resetForm);
$('#run-ai').addEventListener('click', suggestDraftStructure);
$('#copy-ai-prompt').addEventListener('click', copyAiPrompt);
$('#draft-list').addEventListener('click', handleDraftAction);
$('#export-backup').addEventListener('click', exportBackup);
$('#export-publish').addEventListener('click', exportPublishPackage);
$('#import-backup').addEventListener('change', importBackup);
loadPublishedCount();
resetForm();
renderDrafts();
