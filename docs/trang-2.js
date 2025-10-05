// Đọc cấu hình
function readConfig(){
  try { return JSON.parse(localStorage.getItem('masoi:config') || '{}'); }
  catch { return {}; }
}

// Gợi ý đường dẫn ảnh (đặt vào /images). Có thể đổi lại tuỳ ý:
const IMG = {
  soitrum:  './images/soitrum.jpg',
  soi:      './images/soi.jpg',
  dan:      './images/vila.jpg',
  soinguoi: './images/soing.jpg',
  soicon:   './images/soicon.jpg',
  baove:    './images/bv.jpg',
  tietlo:   './images/hunter.webp',
  phuthuy:  './images/pt.jpg',
  hoangtu:  './images/ht.jpg',
  cungcoi:  './images/cc.jpg',
  tientri:  './images/tt.jpg',
  tamlinh:  './images/pi.png',
  tusi:     './images/tusi.png',
  phanboi:  './images/pb.jpg',
  back:     './images/back.jpg'
};

// Meta (nhãn + class màu nền + ảnh)
// Lưu ý: CSS đang có màu riêng cho 5 class (soi, dan, hoangtu, tusi, tamlinh).
// Các class khác nếu chưa có trong CSS vẫn hiển thị bình thường.
const ROLE_META = {
  soitrum:  { label:'SÓI TRÙM',  cls:'soi',      img:IMG.soitrum },
  soi:      { label:'SÓI',       cls:'soi',      img:IMG.soi },
  dan:      { label:'DÂN',       cls:'dan',      img:IMG.dan },
  soinguoi: { label:'SÓI NGƯỜI', cls:'soi',      img:IMG.soinguoi },
  soicon:   { label:'SÓI CON',   cls:'soi',      img:IMG.soicon },
  baove:    { label:'BẢO VỆ',    cls:'baove',    img:IMG.baove },
  tietlo:   { label:'TIẾT LỘ',   cls:'tietlo',   img:IMG.tietlo },
  phuthuy:  { label:'PHÙ THỦY',  cls:'phuthuy',  img:IMG.phuthuy },
  hoangtu:  { label:'HOÀNG TỬ',  cls:'hoangtu',  img:IMG.hoangtu },
  cungcoi:  { label:'CỨNG CỎI',  cls:'cungcoi',  img:IMG.cungcoi },
  tientri:  { label:'TIÊN TRI',  cls:'tientri',  img:IMG.tientri },
  tamlinh:  { label:'TÂM LINH',  cls:'tamlinh',  img:IMG.tamlinh },
  tusi:     { label:'TU SĨ',     cls:'tusi',     img:IMG.tusi },
  phanboi:  { label:'PHẢN BỘI',  cls:'phanboi',  img:IMG.phanboi },
};

const ROLES = Object.keys(ROLE_META);

// DOM
let currentCard = document.getElementById('currentCard');
const leftList  = document.getElementById('leftList');
const totalLeft = document.getElementById('totalLeft');
const drawBtn   = document.getElementById('drawBtn');
const backBtn   = document.getElementById('backBtn');
const hideBtn   = document.getElementById('hideBtn'); // dùng nút Ẩn như đã chỉnh

// State
let deck = [];
let left = {};
let history = [];
let hasVisibleCard = false;

function init(){
  const cfg = readConfig();
  const sum = ROLES.reduce((s,k)=> s + (+cfg[k] || 0), 0);
  if(!sum){ alert('Chưa có cấu hình. Vui lòng nhập ở Trang 1.'); location.href='index.html'; return; }

  deck = [];
  left = {};
  history = [];

  ROLES.forEach(r=>{
    const n = Math.max(0, (+cfg[r]||0)|0);
    left[r] = n;
    for(let i=0;i<n;i++) deck.push(r);
  });

  renderLeft();
  renderTotal();
  showPlaceholder();

  drawBtn.disabled = (deck.length===0) || hasVisibleCard;
  hideBtn.disabled = !hasVisibleCard;
}

function renderLeft(){
  const LABEL = Object.fromEntries(ROLES.map(r=>[r, ROLE_META[r].label]));
  leftList.innerHTML = ROLES.map(r => `
    <li class="li-${r}"><span class="k">${LABEL[r]}</span><span class="v">${left[r]||0}</span></li>
  `).join('');
}
function renderTotal(){ totalLeft.textContent = `Còn lại: ${deck.length}`; }

function showPlaceholder(){
  currentCard.className='card placeholder';
  currentCard.innerHTML = `
    <img class="img" src="${IMG.back}" alt="Mặt sau" />
    <div class="label">Chưa bốc</div>
    <div class="sub">Bấm “Chọn (bốc 1 lá)” để bắt đầu</div>
  `;
  hasVisibleCard=false;
}

function renderCard(role, finished=false){
  const m = ROLE_META[role];
  currentCard.className = `card ${m.cls}`;
  currentCard.innerHTML = `
    <img class="img" src="${m.img}" alt="${m.label}" />
    <div class="label">${m.label}</div>
    <div class="sub">Bạn vừa bốc: ${role}${finished?' — Hết bài!':''}</div>
  `;
}

// Draw / Hide
function drawOne(){
  if(!deck.length || hasVisibleCard) return;

  const idx = Math.floor(Math.random()*deck.length);
  const role = deck.splice(idx,1)[0];

  history.push(role);
  left[role] = Math.max(0,(left[role]||0)-1);

  const finished = deck.length===0;
  renderCard(role, finished);
  hasVisibleCard = true;

  renderLeft(); renderTotal();

  drawBtn.disabled = true;
  hideBtn.disabled = false;

  if(finished){
    try{ localStorage.setItem('masoi:history', JSON.stringify(history)); }catch{}
  }
}
function hideCurrent(){
  if(!hasVisibleCard) return;
  showPlaceholder();
  drawBtn.disabled = (deck.length===0);
  hideBtn.disabled = true;
}

// Events
drawBtn.onclick = drawOne;
hideBtn.onclick = hideCurrent;
backBtn.onclick = () => location.href='index.html';

// Phím nhanh
document.addEventListener('keydown',(e)=>{
  if(e.key===' '||e.key==='Enter'){ e.preventDefault();
    if(!drawBtn.disabled) return drawOne();
    if(!hideBtn.disabled) return hideCurrent();
  }
});

init();
