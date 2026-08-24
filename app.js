const fallbackContent = [
  { id: 'historic-city-unesco', title: 'นครประวัติศาสตร์พระนครศรีอยุธยา', type: 'มรดกโลก', category: 'ประวัติศาสตร์และมรดกโลก', summary: 'เมืองหลวงแห่งที่สองของสยามที่เติบโตเป็นศูนย์กลางการทูต การค้า และวัฒนธรรมระดับนานาชาติ', detail: 'ข้อมูลสำรองจากชุดเนื้อหาที่ตรวจสอบแหล่งอ้างอิงแล้ว', location: 'เกาะเมืองพระนครศรีอยุธยา', status: 'เผยแพร่ — อ้างอิงทางการ', accent: 'art-heritage', featured: true, updated: '24 สิงหาคม 2569', sourceLabel: 'UNESCO — Historic City of Ayutthaya', sourceUrl: 'https://whc.unesco.org/en/list/576' },
  { id: 'ayutthaya-historical-park', title: 'อุทยานประวัติศาสตร์พระนครศรีอยุธยา', type: 'สถานที่', category: 'ประวัติศาสตร์และมรดกโลก', summary: 'พื้นที่โบราณสถานสำคัญบนเกาะเมืองสำหรับอ่านผังเมือง ศาสนสถาน และร่องรอยของราชธานี', detail: 'ข้อมูลสำรองจากชุดเนื้อหาที่ตรวจสอบแหล่งอ้างอิงแล้ว', location: 'เกาะเมืองพระนครศรีอยุธยา', status: 'เผยแพร่ — ตรวจสอบก่อนเดินทาง', accent: 'art-temple', featured: true, updated: '24 สิงหาคม 2569', sourceLabel: 'กรมศิลปากร', sourceUrl: 'https://www.finearts.go.th/ayutthayahistoricalpark/view/29898' },
  { id: 'roti-saimai', title: 'โรตีสายไหม', type: 'อาหาร', category: 'อาหารและเศรษฐกิจท้องถิ่น', summary: 'ขนมหวานที่เป็นภาพจำของอยุธยา พร้อมแนวทางบันทึกข้อมูลร้านโดยไม่เผยแพร่ข้อมูลส่วนบุคคล', detail: 'ข้อมูลสำรองจากชุดเนื้อหาที่ตรวจสอบแหล่งอ้างอิงแล้ว', location: 'ย่านถนนอู่ทองและพื้นที่รอบเกาะเมือง', status: 'เผยแพร่ — ตรวจสอบตามวันเวลา', accent: 'art-food', featured: true, updated: '24 สิงหาคม 2569', sourceLabel: 'การท่องเที่ยวแห่งประเทศไทย', sourceUrl: 'https://thai.tourismthailand.org/Articles' }
];

let records = [];
let activeFilter = 'ทั้งหมด';
let currentQuery = '';
let sortNewestFirst = false;

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
const normalizeSearch = (value = '') => String(value).normalize('NFC').toLocaleLowerCase('th-TH').replace(/\s+/g, ' ').trim();

async function loadContent() {
  try {
    const response = await fetch('data/content.json');
    if (!response.ok) throw new Error('Content unavailable');
    records = await response.json();
  } catch (error) {
    records = fallbackContent;
  }
  const drafts = JSON.parse(localStorage.getItem('ayutthaya-drafts') || '[]');
  records = [...drafts.map((item) => ({ ...item, isDraft: true })), ...records];
  $('#content-count').textContent = String(records.length).padStart(2, '0');
  renderFeatured();
  renderFilters();
  renderCatalog();
}

function cardMarkup(item, featured = false) {
  return `<article class="${featured ? 'feature-card' : 'catalog-card'}" data-card-id="${escapeHtml(item.id)}" tabindex="0" role="button" aria-label="เปิดรายละเอียด ${escapeHtml(item.title)}">
    <div class="card-art ${escapeHtml(item.accent || 'art-river')}"><span class="card-art-label">${escapeHtml(item.type)}</span></div>
    <div class="card-body"><p class="eyebrow">${escapeHtml(item.category)}</p><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p><div class="card-meta"><span>${escapeHtml(item.location)}</span><span>${escapeHtml(item.isDraft ? 'ร่างในเครื่อง' : item.status)}</span></div><span class="card-action" aria-hidden="true">เปิดรายละเอียด <span>↗</span></span></div>
  </article>`;
}

function renderFeatured() {
  $('#featured-list').innerHTML = records.filter((item) => item.featured).slice(0, 3).map((item) => cardMarkup(item, true)).join('');
  bindCardEvents();
}

function renderFilters() {
  const categories = ['ทั้งหมด', ...new Set(records.map((item) => item.type))];
  $('#filter-row').innerHTML = categories.map((category) => `<button type="button" class="filter-chip ${category === activeFilter ? 'active' : ''}" data-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
  document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => { activeFilter = button.dataset.filter; renderFilters(); renderCatalog(); }));
}

function renderCatalog() {
  let visible = records.filter((item) => activeFilter === 'ทั้งหมด' || item.type === activeFilter);
  const query = normalizeSearch(currentQuery);
  if (query) {
    visible = visible.filter((item) => normalizeSearch([item.id, item.title, item.type, item.category, item.summary, item.detail, item.location, item.sourceLabel, item.sourceNote].join(' ')).includes(query));
  }
  if (sortNewestFirst) visible = [...visible].reverse();
  $('#result-count').textContent = query ? `พบ ${visible.length} รายการจาก “${currentQuery.trim()}”` : `พบ ${visible.length} รายการ`;
  $('#catalog').innerHTML = visible.map((item) => cardMarkup(item)).join('');
  $('#empty-state').hidden = visible.length > 0;
  bindCardEvents();
}

function applySearch(value, scrollToResults = false) {
  currentQuery = String(value || '').trim();
  const input = $('#search-input');
  if (input && input.value !== currentQuery) input.value = currentQuery;
  renderCatalog();
  if (scrollToResults) document.querySelector('#places').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function bindCardEvents() {
  ['#featured-list', '#catalog'].forEach((selector) => {
    const container = $(selector);
    if (!container || container.dataset.cardEventsBound === 'true') return;
    container.addEventListener('click', (event) => {
      const card = event.target.closest('[data-card-id]');
      if (card && container.contains(card)) openDetail(card.dataset.cardId);
    });
    container.addEventListener('keydown', (event) => {
      const card = event.target.closest('[data-card-id]');
      if (card && container.contains(card) && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        openDetail(card.dataset.cardId);
      }
    });
    container.dataset.cardEventsBound = 'true';
  });
  document.querySelectorAll('button[data-open-id]').forEach((element) => {
    if (element.dataset.detailBound === 'true') return;
    element.addEventListener('click', () => openDetail(element.dataset.openId));
    element.dataset.detailBound = 'true';
  });
}

function openDetail(id) {
  const item = records.find((record) => record.id === id);
  if (!item) return;
  const sourceBlock = item.sourceUrl ? `<div class="source-block"><strong>แหล่งอ้างอิง</strong><a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.sourceLabel || 'เปิดแหล่งข้อมูล')}</a><p>${escapeHtml(item.sourceNote || 'ตรวจสอบแหล่งข้อมูลเพิ่มเติมก่อนนำไปใช้อ้างอิง')}</p></div>` : '<div class="draft-note">รายการนี้ยังไม่มีแหล่งอ้างอิง ต้องตรวจสอบก่อนเผยแพร่</div>';
  $('#modal-content').innerHTML = `<p class="modal-kicker">${escapeHtml(item.type)} · ${escapeHtml(item.category)}</p><h2 id="modal-title">${escapeHtml(item.title)}</h2><p>${escapeHtml(item.detail || item.summary)}</p><div class="detail-grid"><div class="detail-item"><strong>พื้นที่</strong><span>${escapeHtml(item.location)}</span></div><div class="detail-item"><strong>สถานะข้อมูล</strong><span>${escapeHtml(item.isDraft ? 'ร่างที่บันทึกในเครื่อง' : item.status)}</span></div><div class="detail-item"><strong>วันที่ทบทวน</strong><span>${escapeHtml(item.updated || 'ยังไม่ระบุ')}</span></div><div class="detail-item"><strong>ความเป็นส่วนตัว</strong><span>ไม่มีโปรไฟล์บุคคล</span></div></div>${sourceBlock}`;
  openModal();
}

function openDraftModal() {
  $('#modal-content').innerHTML = `<p class="modal-kicker">CONTENT WORKSPACE</p><h2 id="modal-title">เพิ่มร่างข้อมูล</h2><p>สร้างร่างข้อมูลไว้ในเครื่องก่อนเผยแพร่จริง ระบบนี้ยังไม่ส่งข้อมูลไปยังบริการภายนอก</p><form id="draft-form"><label>ชื่อเรื่อง<input name="title" required placeholder="เช่น เส้นทางริมแม่น้ำสำหรับวันอากาศดี" /></label><label>ประเภท<select name="type"><option>เรื่องเล่า</option><option>สถานที่</option><option>เส้นทาง</option><option>อาหาร</option><option>กิจกรรม</option></select></label><label>คำอธิบายสั้น<textarea name="summary" rows="3" required placeholder="อธิบายเนื้อหาโดยไม่ใส่ข้อมูลบุคคล"></textarea></label><label>พื้นที่หรือบริบท<input name="location" placeholder="เช่น เกาะเมือง / พื้นที่ริมน้ำ" /></label><div class="draft-note">อย่าใส่ชื่อบุคคล เบอร์โทรศัพท์ อีเมลส่วนตัว ใบหน้า หรือข้อมูลที่ทำให้ระบุตัวบุคคลได้</div><button class="button button-primary" type="submit">บันทึกร่างในเครื่อง</button><button class="button button-outline" id="draft-ai" type="button">ให้ AI ช่วยวางโครงร่าง</button></form><ul class="draft-list" id="draft-list"></ul>`;
  openModal();
  $('#draft-form').addEventListener('submit', saveDraft);
  $('#draft-ai').addEventListener('click', suggestDraftStructure);
}

function saveDraft(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const title = String(form.get('title') || '').trim();
  const draft = { id: `draft-${Date.now()}`, title, type: form.get('type'), category: 'ร่างข้อมูล', summary: String(form.get('summary') || '').trim(), detail: 'ร่างข้อมูลที่สร้างโดยผู้จัดทำและบันทึกไว้ในเครื่อง', location: String(form.get('location') || 'ยังไม่ระบุ').trim(), status: 'ร่างในเครื่อง', accent: 'art-urban', featured: false, updated: new Date().toLocaleDateString('th-TH') };
  const drafts = JSON.parse(localStorage.getItem('ayutthaya-drafts') || '[]');
  localStorage.setItem('ayutthaya-drafts', JSON.stringify([draft, ...drafts]));
  records = [draft, ...records];
  $('#content-count').textContent = String(records.length).padStart(2, '0');
  renderFilters(); renderCatalog();
  closeModal();
  document.querySelector('#places').scrollIntoView({ behavior: 'smooth' });
}

function suggestDraftStructure() {
  const form = $('#draft-form');
  const title = form.elements.title.value || 'เรื่องเล่าอยุธยา';
  form.elements.summary.value = `โครงร่างสำหรับ “${title}”\n\n1. สิ่งที่ผู้ใช้ควรรู้\n2. บริบทของพื้นที่\n3. ข้อมูลใช้งานจริง\n4. แหล่งอ้างอิงที่ต้องตรวจสอบ`;
}

function openAiModal() {
  $('#modal-content').innerHTML = `<p class="modal-kicker">AI CONTENT ASSISTANT · DEMO</p><h2 id="modal-title">ผู้ช่วยร่างอย่างปลอดภัย</h2><p>ต้นแบบนี้ยังไม่เรียกใช้ API ภายนอก จึงไม่มีข้อมูลถูกส่งออกจากเครื่องของคุณ</p><label>คำสั่งทดลอง<textarea id="ai-prompt" rows="4">ช่วยวางโครงร่างบทความเกี่ยวกับพื้นที่ริมน้ำ โดยเน้นสถานที่ วัตถุ และการเดินทาง ไม่กล่าวถึงบุคคล</textarea></label><button class="button button-primary" id="run-ai" type="button">สร้างโครงร่าง</button><div id="ai-result" class="draft-note" style="margin-top:18px">ผลลัพธ์จะปรากฏตรงนี้</div>`;
  openModal();
  $('#run-ai').addEventListener('click', () => { $('#ai-result').innerHTML = '<strong>โครงร่างแนะนำ</strong><br />บทนำ: ชวนมองพื้นที่ริมน้ำในฐานะโครงสร้างของเมือง<br />ข้อมูลหลัก: พิกัด · เวลาเข้าถึง · สิ่งที่ควรสังเกต<br />บริบท: ความสัมพันธ์ระหว่างสายน้ำกับเมืองในอดีต<br />ตรวจสอบก่อนเผยแพร่: แหล่งอ้างอิง · ลิขสิทธิ์ภาพ · ข้อมูลส่วนบุคคล'; });
}

function openModal() { $('#modal-backdrop').hidden = false; document.body.style.overflow = 'hidden'; $('#modal-close').focus(); }
function closeModal() { $('#modal-backdrop').hidden = true; document.body.style.overflow = ''; }

$('#search-form').addEventListener('submit', (event) => { event.preventDefault(); applySearch($('#search-input').value, true); });
$('#search-input').addEventListener('input', (event) => applySearch(event.currentTarget.value));
$('#search-input').addEventListener('search', (event) => applySearch(event.currentTarget.value));
document.querySelectorAll('[data-query]').forEach((button) => button.addEventListener('click', () => applySearch(button.dataset.query, true)));
$('#sort-button').addEventListener('click', () => { sortNewestFirst = !sortNewestFirst; $('#sort-button').innerHTML = sortNewestFirst ? 'เรียง: ล่าสุด <span aria-hidden="true">↕</span>' : 'เรียง: แนะนำก่อน <span aria-hidden="true">↕</span>'; renderCatalog(); });
$('#open-draft').addEventListener('click', openDraftModal);
$('#open-ai').addEventListener('click', openAiModal);
$('#modal-close').addEventListener('click', closeModal);
$('#modal-backdrop').addEventListener('click', (event) => { if (event.target === $('#modal-backdrop')) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !$('#modal-backdrop').hidden) closeModal(); });
loadContent();
