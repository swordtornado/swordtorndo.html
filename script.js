// script.js — छोटा और साफ़ confetti + preview + share logic
// Hindi comments added for समझ

// --- Confetti canvas (simple particle system) ---
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let W = canvas.width = innerWidth;
let H = canvas.height = innerHeight;
window.addEventListener('resize', ()=>{ W = canvas.width = innerWidth; H = canvas.height = innerHeight; });

const particles = [];
const colors = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C780FF'];

function spawnConfetti(x = W/2, y = H/3, count = 120) {
  for (let i=0;i<count;i++){
    particles.push({
      x: x + (Math.random()-0.5)*120,
      y: y + (Math.random()-0.5)*40,
      vx: (Math.random()-0.5)*8,
      vy: Math.random()*6 + 2,
      rot: Math.random()*360,
      size: 6 + Math.random()*8,
      color: colors[Math.floor(Math.random()*colors.length)],
      life: 80 + Math.random()*50
    });
  }
}

function updateAndDraw() {
  ctx.clearRect(0,0,W,H);
  for (let i = particles.length-1; i>=0; i--){
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15; // gravity
    p.rot += p.vx * 0.2;
    p.life--;
    ctx.save();
    ctx.translate(p.x,p.y);
    ctx.rotate(p.rot * Math.PI / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
    ctx.restore();
    if (p.y > H + 40 || p.life <= 0) particles.splice(i,1);
  }
  requestAnimationFrame(updateAndDraw);
}
updateAndDraw();

// --- Form + preview + share logic ---
const form = document.getElementById('wish-form');
const toInput = document.getElementById('to');
const msgInput = document.getElementById('msg');
const colorInput = document.getElementById('color');

const previewTitle = document.getElementById('preview-title');
const previewMsg = document.getElementById('preview-msg');
const confettiBtn = document.getElementById('confetti-btn');
const shareBtn = document.getElementById('share-btn');
const mailtoBtn = document.getElementById('mailto-btn');
const resetBtn = document.getElementById('reset-btn');
const yearSpan = document.getElementById('year');
yearSpan.textContent = new Date().getFullYear();

// URL params से अगर कोई message आए तो preview करें
function applyParamsFromURL(){
  const params = new URLSearchParams(location.search);
  const to = params.get('to');
  const msg = params.get('msg');
  const color = params.get('color');
  if (to) toInput.value = decodeURIComponent(to);
  if (msg) msgInput.value = decodeURIComponent(msg);
  if (color) colorInput.value = decodeURIComponent(color);
  updatePreview();
}
function updatePreview(){
  const to = toInput.value.trim();
  const msg = msgInput.value.trim() || 'यह पर्व आपके जीवन में खुशियाँ और समृद्धि लाए।';
  previewTitle.textContent = to ? `${to} — आपको मकर संक्रांति की शुभकामनाएँ` : 'आपको मकर संक्रांति की हार्दिक शुभकामनाएँ';
  previewMsg.textContent = msg;
  // रंग लागू करें — kite की gradient को बदलना आसान नहीं DOM से, तो कार्ड बैकग्राउंड बदलते हैं
  document.documentElement.style.setProperty('--accent', colorInput.value || '#ff9a9e');
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  updatePreview();
  // URL में params जोड़ें ताकि शेयर करने पर वही दिखे
  const params = new URLSearchParams();
  if (toInput.value.trim()) params.set('to', encodeURIComponent(toInput.value.trim()));
  if (msgInput.value.trim()) params.set('msg', encodeURIComponent(msgInput.value.trim()));
  if (colorInput.value) params.set('color', encodeURIComponent(colorInput.value));
  const newUrl = location.origin + location.pathname + '?' + params.toString();
  history.replaceState({}, '', newUrl);
});

// confetti button
confettiBtn.addEventListener('click', ()=>{
  spawnConfetti(innerWidth * 0.5, innerHeight*0.2, 140);
});

// share (copy link)
shareBtn.addEventListener('click', async ()=>{
  const url = location.href;
  try {
    await navigator.clipboard.writeText(url);
    shareBtn.textContent = '✅ कॉपी हो गया!';
    setTimeout(()=>shareBtn.textContent = '🔗 लिंक कॉपी करें', 1800);
  } catch (err) {
    alert('Copy failed — यहाँ से मैन्युअल कॉपी करें:\n' + url);
  }
});

// mailto link — prefill subject & body
mailtoBtn.addEventListener('click', ()=>{
  const subject = encodeURIComponent('शुभ मकर संक्रांति');
  const body = encodeURIComponent(`${previewTitle.textContent}\n\n${previewMsg.textContent}\n\n${location.href}`);
  mailtoBtn.href = `mailto:?subject=${subject}&body=${body}`;
});

// reset
resetBtn.addEventListener('click', ()=>{
  toInput.value = '';
  msgInput.value = '';
  colorInput.value = '#ff9a9e';
  updatePreview();
  history.replaceState({}, '', location.pathname);
});

// on load apply params
applyParamsFromURL();
