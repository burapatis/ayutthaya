const DRAFT_KEY = 'ayutthaya-drafts';
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));

function readDrafts() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]');
  } catch (error) {
    return [];
  }
}

function writeDrafts(drafts) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
}

async function loadPublishedCount() {
  try {
    const response = await fetch('data/content.json');
    if (!response.ok) throw new Error('Content unavailable');
    const records = await response.json();
    $('#published-count').textContent = String(records.length).padStart(2, '0');
  } catch (error) {
    $('#published-count').textContent = '—';
  }
}

function renderDrafts() {
  const drafts = readDrafts();
  $('#draft-count').textContent = String(drafts.length).padStart(2, '0');
  if (!drafts.length) {
    $('#draft-list').innerHTML = '<div class="draft-empty"><strong>ยังไม่มีร่างข้อมูล</strong><span>ร่างที่บันทึกจากฟอร์มจะปรากฏตรงนี้</span></div>';
    return;
  }
  $('#draft-list').innerHTML = drafts.map((draft) => `<article class="draft-item"><div><span class="status-pill status-${escapeHtml(String(draft.status || 'Draft').toLowerCase().replace(/\s+/g, '-'))}">${escapeHtml(draft.status || 'Draft')}</span><h3>${escapeHtml(draft.title)}</h3><p>${escapeHtml(draft.type || 'ยังไม่ระบุ')} · ${escapeHtml(draft.updated || 'ยังไม่ระบุ')}</p></div><button type="button" class="draft-delete" data-delete-draft="${escapeHtml(draft.id)}">ลบ</button></article>`).join('');
  document.querySelectorAll('[data-delete-draft]').forEach((button) => button.addEventListener('click', () => {
    writeDrafts(readDrafts().filter((draft) => draft.id !== button.dataset.deleteDraft));
    renderDrafts();
  }));
}

function saveDraft(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const title = String(form.get('title') || '').trim();
  const draft = {
    id: `draft-${Date.now()}`,
    title,
    type: String(form.get('type') || 'เรื่องเล่า'),
    category: String(form.get('category') || 'ร่างข้อมูล').trim(),
    summary: String(form.get('summary') || '').trim(),
    detail: String(form.get('detail') || '').trim(),
    location: String(form.get('location') || 'ยังไม่ระบุ').trim(),
    sourceLabel: String(form.get('sourceLabel') || '').trim(),
    sourceUrl: String(form.get('sourceUrl') || '').trim(),
    status: String(form.get('status') || 'Draft'),
    updated: String(form.get('updated') || 'ยังไม่ระบุ').trim(),
    accent: 'art-urban',
    featured: false
  };
  writeDrafts([draft, ...readDrafts()]);
  event.currentTarget.reset();
  event.currentTarget.elements.category.value = 'ร่างข้อมูล';
  renderDrafts();
  showMessage('บันทึกร่างไว้ในอุปกรณ์แล้ว');
}

function suggestDraftStructure() {
  const prompt = $('#ai-prompt').value.trim() || 'เรื่องเล่าอยุธยา';
  $('#ai-result').innerHTML = `<strong>โครงร่างแนะนำจากคำสั่งของคุณ</strong><ol><li>ประเด็นสำคัญที่ผู้อ่านควรรู้จาก “${escapeHtml(prompt)}”</li><li>บริบทของพื้นที่ วัตถุ หรือการใช้งานในปัจจุบัน</li><li>ข้อมูลที่ผู้ใช้ต้องใช้จริง เช่น เวลาเข้าถึง การเดินทาง หรือข้อควรทราบ</li><li>รายการแหล่งอ้างอิงและประเด็นที่ยังต้องตรวจสอบ</li><li>คำบรรยายภาพและ Alt Text โดยไม่ระบุข้อมูลส่วนบุคคล</li></ol><span class="ai-disclaimer">นี่เป็นโครงร่างตัวอย่าง ไม่ใช่ข้อเท็จจริงที่พร้อมเผยแพร่</span>`;
}

function showMessage(message) {
  const element = $('#save-message');
  element.textContent = message;
  element.hidden = false;
  window.setTimeout(() => { element.hidden = true; }, 2600);
}

$('#draft-form').addEventListener('submit', saveDraft);
$('#reset-draft').addEventListener('click', () => { $('#draft-form').reset(); $('#draft-form').elements.category.value = 'ร่างข้อมูล'; });
$('#run-ai').addEventListener('click', suggestDraftStructure);
const formActions = document.querySelector('.form-actions');
formActions.insertAdjacentHTML('beforeend', '<span id="save-message" class="save-message" role="status" hidden></span>');
loadPublishedCount();
renderDrafts();
