const fallbackContent = [
  { id: 'historic-city-unesco', title: 'นครประวัติศาสตร์พระนครศรีอยุธยา', type: 'มรดกโลก', category: 'ประวัติศาสตร์และมรดกโลก', summary: 'เมืองหลวงแห่งที่สองของสยามที่เติบโตเป็นศูนย์กลางการทูต การค้า และวัฒนธรรมระดับนานาชาติ', detail: 'ข้อมูลสำรองจากชุดเนื้อหาที่ตรวจสอบแหล่งอ้างอิงแล้ว', location: 'เกาะเมืองพระนครศรีอยุธยา', status: 'เผยแพร่ — อ้างอิงทางการ', accent: 'art-heritage', featured: true, updated: '24 สิงหาคม 2569', sourceLabel: 'UNESCO — Historic City of Ayutthaya', sourceUrl: 'https://whc.unesco.org/en/list/576', image: 'assets/illustrations/historic-city-unesco.jpg' },
  { id: 'ayutthaya-historical-park', title: 'อุทยานประวัติศาสตร์พระนครศรีอยุธยา', type: 'สถานที่', category: 'ประวัติศาสตร์และมรดกโลก', summary: 'พื้นที่โบราณสถานสำคัญบนเกาะเมืองสำหรับอ่านผังเมือง ศาสนสถาน และร่องรอยของราชธานี', detail: 'ข้อมูลสำรองจากชุดเนื้อหาที่ตรวจสอบแหล่งอ้างอิงแล้ว', location: 'เกาะเมืองพระนครศรีอยุธยา', status: 'เผยแพร่ — ตรวจสอบก่อนเดินทาง', accent: 'art-temple', featured: true, updated: '24 สิงหาคม 2569', sourceLabel: 'กรมศิลปากร', sourceUrl: 'https://www.finearts.go.th/ayutthayahistoricalpark/view/29898', image: 'assets/illustrations/ayutthaya-historical-park.jpg' },
  { id: 'roti-saimai', title: 'โรตีสายไหม', type: 'อาหาร', category: 'อาหารและเศรษฐกิจท้องถิ่น', summary: 'ขนมหวานที่เป็นภาพจำของอยุธยา พร้อมแนวทางบันทึกข้อมูลร้านโดยไม่เผยแพร่ข้อมูลส่วนบุคคล', detail: 'ข้อมูลสำรองจากชุดเนื้อหาที่ตรวจสอบแหล่งอ้างอิงแล้ว', location: 'ย่านถนนอู่ทองและพื้นที่รอบเกาะเมือง', status: 'เผยแพร่ — ตรวจสอบตามวันเวลา', accent: 'art-food', featured: true, updated: '24 สิงหาคม 2569', sourceLabel: 'การท่องเที่ยวแห่งประเทศไทย', sourceUrl: 'https://thai.tourismthailand.org/Articles', image: 'assets/illustrations/roti-saimai.jpg' }
];

let records = [];
let activeFilter = 'ทั้งหมด';
let activeLens = 'all';
let currentQuery = '';
let sortNewestFirst = false;

const lensTypes = {
  past: new Set(['มรดกโลก', 'สถานที่', 'วัตถุและศาสนสถาน', 'ศาสนสถาน', 'วัตถุ']),
  today: new Set(['เรื่องเล่า', 'อาหาร', 'เส้นทาง', 'กิจกรรม', 'ฐานข้อมูล', 'เครื่องมือ'])
};
const lensLabels = { past: 'อดีต', today: 'วันนี้' };

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
  $('#content-count').textContent = String(records.length).padStart(2, '0');
  renderFeatured();
  renderFilters();
  renderCatalog();
  bindLensEvents();
}

function cardMarkup(item, featured = false) {
  const imageMarkup = item.image ? `<img class="card-image" src="${escapeHtml(item.image)}" alt="" loading="lazy" decoding="async" aria-hidden="true">` : '';
  return `<article class="${featured ? 'feature-card' : 'catalog-card'}" data-card-id="${escapeHtml(item.id)}" tabindex="0" role="button" aria-label="เปิดรายละเอียด ${escapeHtml(item.title)}">
    <div class="card-art ${escapeHtml(item.accent || 'art-river')}">${imageMarkup}<span class="card-art-label">${escapeHtml(item.type)}</span><span class="card-art-credit">ภาพประกอบ AI</span></div>
    <div class="card-body"><p class="eyebrow">${escapeHtml(item.category)}</p><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p><div class="card-meta"><span>${escapeHtml(item.location)}</span><span>${escapeHtml(item.isDraft ? 'ร่างในเครื่อง' : item.status)}</span></div><span class="card-action" aria-hidden="true">เปิดรายละเอียด <span>↗</span></span></div>
  </article>`;
}

function renderFeatured() {
  $('#featured-list').innerHTML = records.filter((item) => item.featured).slice(0, 3).map((item) => cardMarkup(item, true)).join('');
  bindCardEvents();
}

function renderFilters() {
  const categories = ['ทั้งหมด', ...new Set(records.map((item) => item.type))];
  $('#filter-row').innerHTML = categories.map((category) => `<button type="button" class="filter-chip ${activeLens === 'all' && category === activeFilter ? 'active' : ''}" data-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
  document.querySelectorAll('[data-filter]').forEach((button) => {
    if (button.dataset.filterBound === 'true') return;
    button.addEventListener('click', () => { activeLens = 'all'; activeFilter = button.dataset.filter; renderFilters(); renderCatalog(); });
    button.dataset.filterBound = 'true';
  });
}

function renderCatalog() {
  const lensRecords = activeLens === 'all' ? records : records.filter((item) => lensTypes[activeLens]?.has(item.type));
  let visible = lensRecords.filter((item) => activeFilter === 'ทั้งหมด' || item.type === activeFilter);
  const query = normalizeSearch(currentQuery);
  if (query) {
    visible = visible.filter((item) => normalizeSearch([item.id, item.title, item.type, item.category, item.summary, item.detail, item.location, item.sourceLabel, item.sourceNote].join(' ')).includes(query));
  }
  if (sortNewestFirst) visible = [...visible].reverse();
  const lensLabel = activeLens === 'all' ? '' : ` · มุมมอง${lensLabels[activeLens]}`;
  $('#result-count').textContent = query ? `พบ ${visible.length} รายการจาก “${currentQuery.trim()}”${lensLabel}` : `พบ ${visible.length} รายการ${lensLabel}`;
  $('#catalog').innerHTML = visible.map((item) => cardMarkup(item)).join('');
  $('#empty-state').hidden = visible.length > 0;
  bindCardEvents();
}

function applySearch(value, scrollToResults = false) {
  activeLens = 'all';
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

function bindLensEvents() {
  document.querySelectorAll('[data-lens]').forEach((element) => {
    if (element.dataset.lensBound === 'true') return;
    element.addEventListener('click', (event) => {
      event.preventDefault();
      activeLens = element.dataset.lens;
      activeFilter = 'ทั้งหมด';
      currentQuery = '';
      const input = $('#search-input');
      if (input) input.value = '';
      renderFilters();
      renderCatalog();
      document.querySelector('#places').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    element.dataset.lensBound = 'true';
  });
}

function openDetail(id) {
  const item = records.find((record) => record.id === id);
  if (!item) return;
  const sourceBlock = item.sourceUrl ? `<div class="source-block"><strong>แหล่งอ้างอิง</strong><a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.sourceLabel || 'เปิดแหล่งข้อมูล')}</a><p>${escapeHtml(item.sourceNote || 'ตรวจสอบแหล่งข้อมูลเพิ่มเติมก่อนนำไปใช้อ้างอิง')}</p></div>` : '<div class="draft-note">รายการนี้ยังไม่มีแหล่งอ้างอิง ต้องตรวจสอบก่อนเผยแพร่</div>';
  const imageBlock = item.image ? `<figure class="modal-visual"><img src="${escapeHtml(item.image)}" alt="ภาพประกอบ: ${escapeHtml(item.title)}" loading="eager"><figcaption>ภาพประกอบสร้างด้วย AI ไม่ใช่ภาพหลักฐานทางประวัติศาสตร์</figcaption></figure>` : '';
  $('#modal-content').innerHTML = `<p class="modal-kicker">${escapeHtml(item.type)} · ${escapeHtml(item.category)}</p><h2 id="modal-title">${escapeHtml(item.title)}</h2>${imageBlock}<p>${escapeHtml(item.detail || item.summary)}</p><div class="detail-grid"><div class="detail-item"><strong>พื้นที่</strong><span>${escapeHtml(item.location)}</span></div><div class="detail-item"><strong>สถานะข้อมูล</strong><span>${escapeHtml(item.isDraft ? 'ร่างที่บันทึกในเครื่อง' : item.status)}</span></div><div class="detail-item"><strong>วันที่ทบทวน</strong><span>${escapeHtml(item.updated || 'ยังไม่ระบุ')}</span></div><div class="detail-item"><strong>ความเป็นส่วนตัว</strong><span>ไม่มีโปรไฟล์บุคคล</span></div></div>${sourceBlock}`;
  openModal();
}

function openModal() { $('#modal-backdrop').hidden = false; document.body.style.overflow = 'hidden'; $('#modal-close').focus(); }
function closeModal() { $('#modal-backdrop').hidden = true; document.body.style.overflow = ''; }

$('#search-form').addEventListener('submit', (event) => { event.preventDefault(); applySearch($('#search-input').value, true); });
$('#search-input').addEventListener('input', (event) => applySearch(event.currentTarget.value));
$('#search-input').addEventListener('search', (event) => applySearch(event.currentTarget.value));
document.querySelectorAll('[data-query]').forEach((button) => button.addEventListener('click', () => applySearch(button.dataset.query, true)));
$('#sort-button').addEventListener('click', () => { sortNewestFirst = !sortNewestFirst; $('#sort-button').innerHTML = sortNewestFirst ? 'เรียง: ล่าสุด <span aria-hidden="true">↕</span>' : 'เรียง: แนะนำก่อน <span aria-hidden="true">↕</span>'; renderCatalog(); });
$('#modal-close').addEventListener('click', closeModal);
$('#modal-backdrop').addEventListener('click', (event) => { if (event.target === $('#modal-backdrop')) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !$('#modal-backdrop').hidden) closeModal(); });
loadContent();
