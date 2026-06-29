/**
 * strip.js — 4 layouts, color picker, date stamp
 */

const LAYOUTS = {
  classic: {
    label: 'Classic 4',
    photoCount: 4,
    stripW: 240, stripH: 908,
    frameW: 216, frameH: 162,
    photos: [
      { x: 12, y: 12  },
      { x: 12, y: 186 },
      { x: 12, y: 360 },
      { x: 12, y: 534 },
    ],
    footerY: 870,
  },
  short: {
    label: 'Short 3',
    photoCount: 3,
    stripW: 240, stripH: 690,
    frameW: 216, frameH: 162,
    photos: [
      { x: 12, y: 12  },
      { x: 12, y: 186 },
      { x: 12, y: 360 },
    ],
    footerY: 660,
  },
  polaroid: {
    label: 'Polaroid',
    photoCount: 1,
    stripW: 300, stripH: 380,
    frameW: 260, frameH: 260,
    photos: [
      { x: 20, y: 20 },
    ],
    footerY: 348,
  },
  grid: {
    label: 'Grid 2×2',
    photoCount: 4,
    stripW: 480, stripH: 504,
    frameW: 222, frameH: 222,
    photos: [
      { x: 12,  y: 12  },
      { x: 246, y: 12  },
      { x: 12,  y: 246 },
      { x: 246, y: 246 },
    ],
    footerY: 482,
  },
};

let activeLayout = 'classic';
let stripColor   = '#111111';
let showDate     = false;

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
      const isDark = isColorDark(stripColor);
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
      ctx.fillRect(pos.x, pos.y, l.frameW, l.frameH);
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Photo ${i + 1}`, pos.x + l.frameW / 2, pos.y + l.frameH / 2);
    }
  });

  // Date stamp
  if (showDate) {
    const dateStr = new Date().toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).toUpperCase();
    const isDark = isColorDark(stripColor);
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.4)';
    ctx.font = 'italic 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(dateStr, l.stripW / 2, l.footerY);
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

function setShowDate(val) {
  showDate = val;
}

function downloadStrip() {
  const link = document.createElement('a');
  link.download = `photobooth-${activeLayout}-${Date.now()}.png`;
  link.href = stripCanvas.toDataURL('image/png');
  link.click();
}

resizeCanvas();
renderStrip([]);