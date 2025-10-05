// Helpers
const $ = (s, el=document)=>el.querySelector(s);
const $$ = (s, el=document)=>Array.from(el.querySelectorAll(s));

const ROLE_IDS = [
  'soitrum','soi','dan','soinguoi','soicon',
  'baove','tietlo','phuthuy','hoangtu','cungcoi',
  'tientri','tamlinh','tusi','phanboi'
];

const form = $('#form');
const inputs = $$('#form input[type="number"]');
const totalBox = $('#totalBox');
const validationMsg = $('#validationMsg');
const enterBtn = $('#enterBtn');
const statusEl = $('#status');
const resetBtn = $('#reset');

// Khởi tạo từ localStorage
(function initFromStorage(){
  let saved={};
  try{ saved = JSON.parse(localStorage.getItem('masoi:config')||'{}'); }catch{}
  for(const id of ROLE_IDS){
    const el = document.getElementById(id);
    if (el && Number.isInteger(+saved[id]) && +saved[id] >= 0) el.value = saved[id];
  }
})();

function parseIntOrZero(v){ const n=parseInt(v,10); return Number.isFinite(n)&&n>=0?n:0; }

function update(){
  let valid = true, total = 0;
  inputs.forEach(inp=>{
    const v = inp.value.trim();
    const n = v===''?0:Number(v);
    const isInt = Number.isInteger(n);
    const ok = (v==='' || (isInt && n>=0));
    inp.closest('.field').classList.toggle('invalid', !ok);
    if(!ok) valid=false;
    total += parseIntOrZero(v);
  });
  totalBox.textContent = `Tổng người chơi: ${total}`;
  if(!total || !valid){
    validationMsg.textContent = !valid ? 'Có ô không hợp lệ. Chỉ nhận số nguyên ≥ 0.' : 'Tổng người chơi phải lớn hơn 0.';
    validationMsg.className='bad'; statusEl.textContent='Chưa hợp lệ'; enterBtn.disabled=true;
  }else{
    validationMsg.textContent='Cấu hình hợp lệ. Bạn có thể Enter.';
    validationMsg.className='good'; statusEl.textContent='Hợp lệ'; enterBtn.disabled=false;
  }
}
inputs.forEach(inp=>inp.addEventListener('input', update));
update();

// Submit → lưu & sang Trang 2
form.addEventListener('submit',(e)=>{
  e.preventDefault();
  if(enterBtn.disabled) return;

  const data = {};
  for(const id of ROLE_IDS){ data[id] = parseIntOrZero(document.getElementById(id).value); }
  localStorage.setItem('masoi:config', JSON.stringify(data));
  location.href = 'trang-2.html';
});

// Reset
resetBtn.addEventListener('click', ()=>{
  inputs.forEach(i=> i.value='');
  update();
  // không xoá lịch sử ở đây
});

// ==== Hiển thị lịch sử (lần bốc gần nhất khi đã bốc hết) ====
const historyBox = document.getElementById('historyBox');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

function loadHistory(){
  let hist=[];
  try{ hist = JSON.parse(localStorage.getItem('masoi:history')||'[]'); }catch{}
  if(Array.isArray(hist) && hist.length){
    historyBox.hidden = false;
    // map nhãn:
    const LABEL = {
      soitrum:'SÓI TRÙM', soi:'SÓI', dan:'DÂN', soinguoi:'SÓI NGƯỜI', soicon:'SÓI CON',
      baove:'BẢO VỆ', tietlo:'TIẾT LỘ', phuthuy:'PHÙ THỦY', hoangtu:'HOÀNG TỬ', cungcoi:'CỨNG CỎI',
      tientri:'TIÊN TRI', tamlinh:'TÂM LINH', tusi:'TU SĨ', phanboi:'PHẢN BỘI'
    };
    historyList.innerHTML = hist.map((r,i)=>`<li><strong>${i+1}.</strong> ${LABEL[r]||r} <span style="opacity:.7">(${r})</span></li>`).join('');
  }else{
    historyBox.hidden = true;
    historyList.innerHTML='';
  }
}
clearHistoryBtn.addEventListener('click', ()=>{
  localStorage.removeItem('masoi:history');
  loadHistory();
});
loadHistory();
