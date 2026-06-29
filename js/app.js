/**
 * app.js
 * Main controller — camera, countdown, capture, UI state.
 * Depends on: filters.js, strip.js
 */

// ─── DOM refs ──────────────────────────────────────────────
const video       = document.getElementById('video');
const flashEl     = document.getElementById('flash');
const countdownEl = document.getElementById('countdown');
const statusEl    = document.getElementById('status');
const shotCountEl = document.getElementById('shot-count');
const shootBtn    = document.getElementById('shoot-btn');
const retakeBtn   = document.getElementById('retake-btn');
const dlBtn       = document.getElementById('dl-btn');
const printBtn    = document.getElementById('print-btn');
const resetBtn    = document.getElementById('reset-btn');
const postControls = document.getElementById('post-controls');

// ─── State ─────────────────────────────────────────────────
let shots        = [];        // array of captured frame canvases (max 4)
let activeFilter = 'none';
let isShooting   = false;
const MAX_SHOTS  = 4;let MAX_SHOTS = LAYOUTS[activeLayout].photoCount;

// ─── Camera setup ──────────────────────────────────────────
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
      audio: false,
    });
    video.srcObject = stream;
    video.style.filter = FILTER_CSS[activeFilter];
    shootBtn.disabled = false;
    setStatus('camera ready — take up to 4 photos.');
  } catch (err) {
    setStatus('⚠ camera access denied. allow camera permission and reload.');
    console.error('getUserMedia error:', err);
  }
}

// ─── Filter switching ───────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    video.style.filter = FILTER_CSS[activeFilter];
  });
});

document.querySelectorAll('.layout-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (shots.length > 0) return;
    document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setLayout(btn.dataset.layout);
    MAX_SHOTS = LAYOUTS[btn.dataset.layout].photoCount;
    renderStrip(shots);
    updateUI();
  });
});

// ─── Capture helpers ────────────────────────────────────────

/**
 * Draw the current video frame onto a new offscreen canvas,
 * mirror it (selfie), and apply the current pixel filter.
 * @returns {HTMLCanvasElement}
 */
function captureFrame() {
  const c   = document.createElement('canvas');
  c.width   = FRAME_W;
  c.height  = FRAME_H;
  const ctx = c.getContext('2d');

  // Mirror horizontally (selfie feel)
  ctx.save();
  ctx.translate(FRAME_W, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, FRAME_W, FRAME_H);
  ctx.restore();

  // Apply pixel filter
  applyFilter(ctx, FRAME_W, FRAME_H, activeFilter);
  return c;
}

/** 3-2-1 countdown, returns a promise that resolves when done */
async function runCountdown() {
  for (let n = 3; n >= 1; n--) {
    countdownEl.textContent = n;
    await delay(850);
  }
  countdownEl.textContent = '';
}

/** Flash animation */
function doFlash() {
  flashEl.classList.add('on');
  setTimeout(() => flashEl.classList.remove('on'), 120);
}

/** Simple delay */
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Shoot ─────────────────────────────────────────────────
shootBtn.addEventListener('click', async () => {
  if (isShooting || shots.length >= MAX_SHOTS) return;
  isShooting = true;
  shootBtn.disabled = true;
  retakeBtn.style.display = 'none';

  await runCountdown();
  doFlash();

  const frame = captureFrame();
  shots.push(frame);
  renderStrip(shots);
  updateUI();

  isShooting = false;
});

// ─── Retake last ───────────────────────────────────────────
retakeBtn.addEventListener('click', () => {
  if (shots.length === 0) return;
  shots.pop();
  renderStrip(shots);
  updateUI();
});

// ─── Download ──────────────────────────────────────────────
dlBtn.addEventListener('click', downloadStrip);

// ─── Print ─────────────────────────────────────────────────
printBtn.addEventListener('click', () => window.print());

// ─── Reset ─────────────────────────────────────────────────
resetBtn.addEventListener('click', () => {
  shots = [];
  renderStrip(shots);
  postControls.style.display = 'none';
  retakeBtn.style.display = 'none';
  shootBtn.disabled = false;
  shootBtn.textContent = 'take photo 📷';
  setStatus('camera ready — take up to 4 photos.');
  shotCountEl.textContent = '';
});

// ─── UI state sync ─────────────────────────────────────────
function updateUI() {
  const count     = shots.length;
  const remaining = MAX_SHOTS - count;
  const done      = count === MAX_SHOTS;

  // Shot counter
  shotCountEl.textContent = done
    ? '4/4 — strip complete!'
    : `${count}/${MAX_SHOTS} — ${remaining} more to go`;

  // Status message
  setStatus(done
    ? 'all done! download or print your strip below.'
    : 'nice! take the next one whenever you\'re ready.');

  // Shoot button
  shootBtn.disabled  = done;
  shootBtn.textContent = done ? '✓ Strip complete' : 'take photo 📷';

  // Retake button (available after at least 1 shot, before strip is full)
  retakeBtn.style.display = count > 0 && !done ? 'block' : 'none';

  // Post-controls
  postControls.style.display = done ? 'flex' : 'none';

  document.getElementById('layout-picker').style.display = shots.length > 0 ? 'none' : 'block';
  document.getElementById('strip-editor').style.display  = done ? 'block' : 'none';
}

function setStatus(msg) {
  statusEl.textContent = msg;
}

// Color swatches
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setStripColor(btn.dataset.color);
    document.getElementById('color-picker').value = btn.dataset.color;
    renderStrip(shots);
  });
});

// Free color picker
document.getElementById('color-picker').addEventListener('input', (e) => {
  document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
  setStripColor(e.target.value);
  renderStrip(shots);
});

// Date stamp toggle
document.getElementById('date-toggle').addEventListener('change', (e) => {
  setShowDate(e.target.checked);
  renderStrip(shots);
});

// ─── Boot ──────────────────────────────────────────────────
startCamera();
