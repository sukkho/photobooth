/**
 * strip.js — 4 layouts, color picker, date stamp
 */

const LAYOUTS = {
  classic: {
    label: 'classic',
    photoCount: 4,
    stripW: 480, stripH: 1520,
    frameW: 432, frameH: 324,
    photos: [
      { x: 24, y: 24  },
      { x: 24, y: 372 },
      { x: 24, y: 720 },
      { x: 24, y: 1068 },
    ],
    footerY: 1480,
  },
  short: {
    label: 'short',
    photoCount: 3,
    stripW: 480, stripH: 1140,
    frameW: 432, frameH: 324,
    photos: [
      { x: 24, y: 24  },
      { x: 24, y: 372 },
      { x: 24, y: 720 },
    ],
    footerY: 1100,
  },
  polaroid: {
    label: 'polaroid',
    photoCount: 1,
    stripW: 600, stripH: 560,
    frameW: 520, frameH: 390,
    photos: [
      { x: 40, y: 40 },
    ],
    footerY: 510,
  },
  grid: {
    label: 'grid',
    photoCount: 4,
    stripW: 970, stripH: 760,
    frameW: 444, frameH: 332,
    photos: [
      { x: 24,  y: 24  },
      { x: 500, y: 24  },
      { x: 24,  y: 400 },
      { x: 500, y: 400 },
    ],
    footerY: 720,
  },
};

let activeLayout = 'classic';
let stripColor   = '#111111';
let stampText = ''

const stripCanvas = document.getElementById('strip-canvas');

function resizeCanvas() {
  const l = LAYOUTS[activeLayout];
  stripCanvas.width  = l.stripW;
  stripCanvas.height = l.stripH;
}

function renderStrip(shots) {
  const l   = LAYOUTS[activeLayout];
  const ctx = stripCanvas.getContext('2d');

  // Background
  ctx.fillStyle = stripColor;
  ctx.fillRect(0, 0, l.stripW, l.stripH);

  // Photos / placeholders
  l.photos.forEach((pos, i) => {
    if (shots[i]) {
      ctx.drawImage(shots[i], pos.x, pos.y, l.frameW, l.frameH);
    } else {
      // Placeholder box
      ctx.save();
      const isDark = isColorDark(stripColor);
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
      ctx.fillRect(pos.x, pos.y, l.frameW, l.frameH);
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Photo ${i + 1}`, pos.x + l.frameW / 2, pos.y + l.frameH / 2);
      ctx.restore();
    }
  });

  // Text stamp (not shown for grid)
  if (stampText && activeLayout !== 'grid') {
    const isDark = isColorDark(stripColor);
    ctx.fillStyle = isDark ? '#ffffff' : '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'italic 36px monospace';
    ctx.fillText(stampText, l.stripW / 2, l.footerY);
  }
}

// Helper — decides whether to use light or dark text on top of the chosen color
function isColorDark(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
}

function setLayout(key) {
  activeLayout = key;
  resizeCanvas();
}

function setStripColor(color) {
  stripColor = color;
}

function setStampText(val) {
  stampText = val;
}

function downloadStrip() {
  const link = document.createElement('a');
  link.download = `photobooth-${activeLayout}-${Date.now()}.png`;
  link.href = stripCanvas.toDataURL('image/png');
  link.click();
}

resizeCanvas();
renderStrip([]);