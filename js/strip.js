/**
 * strip.js
 * Builds and renders the photo-strip canvas.
 *
 * Strip layout (all sizes in px):
 *   Width  : STRIP_W  (240)
 *   Padding: PAD      (12) — around edges and between frames
 *   Frame  : FRAME_W × FRAME_H  (216 × 162)
 *   4 frames + padding + footer = STRIP_H
 */

const STRIP_W  = 240;
const PAD      = 12;
const FRAME_W  = STRIP_W - PAD * 2;        // 216
const FRAME_H  = Math.round(FRAME_W * 3 / 4); // 162 (4:3)
const FOOTER_H = 28;
const STRIP_H  = PAD + (FRAME_H + PAD) * 4 + FOOTER_H;

/** @type {HTMLCanvasElement} */
const stripCanvas = document.getElementById('strip-canvas');
stripCanvas.width  = STRIP_W;
stripCanvas.height = STRIP_H;

/**
 * Re-render the strip canvas from an array of captured frame canvases.
 * Empty slots are drawn as placeholder boxes.
 * @param {HTMLCanvasElement[]} shots  — up to 4 items
 */
function renderStrip(shots) {
  const ctx = stripCanvas.getContext('2d');

  // Background
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, STRIP_W, STRIP_H);

  for (let i = 0; i < 4; i++) {
    const x = PAD;
    const y = PAD + i * (FRAME_H + PAD);

    if (shots[i]) {
      ctx.drawImage(shots[i], x, y, FRAME_W, FRAME_H);
    } else {
      // Placeholder
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(x, y, FRAME_W, FRAME_H);
      ctx.fillStyle = '#555';
      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Photo ${i + 1}`, x + FRAME_W / 2, y + FRAME_H / 2);
    }
  }

  // Footer label
  ctx.fillStyle = '#666';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const footerY = PAD + 4 * (FRAME_H + PAD) + FOOTER_H / 2;
  ctx.fillText('✦ PHOTOBOOTH ✦', STRIP_W / 2, footerY);
}

/**
 * Trigger a PNG download of the current strip canvas.
 */
function downloadStrip() {
  const link = document.createElement('a');
  link.download = `photobooth-strip-${Date.now()}.png`;
  link.href = stripCanvas.toDataURL('image/png');
  link.click();
}

// Draw the empty strip on load
renderStrip([]);
