/**
 * filters.js
 * Canvas pixel-level filter implementations.
 * Each filter receives an ImageData object and mutates it in place.
 */

const FILTERS = {

  // Pass-through — no change
  none(data) {},

  // Luminance-weighted grayscale
  grayscale(data) {
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
  },

  // Classic sepia tone
  sepia(data) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      data[i]     = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
  },

  // Boosted saturation + slight contrast
  vivid(data) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const s = 1.9;
      data[i]     = Math.min(255, Math.max(0, gray + (r - gray) * s));
      data[i + 1] = Math.min(255, Math.max(0, gray + (g - gray) * s));
      data[i + 2] = Math.min(255, Math.max(0, gray + (b - gray) * s));
    }
  },

  // Cool / blue-tinted
  cool(data) {
    for (let i = 0; i < data.length; i += 4) {
      data[i]     = Math.min(255, data[i] * 0.85);        // reduce red
      data[i + 2] = Math.min(255, data[i + 2] * 1.2 + 12); // boost blue
    }
  },
};

/**
 * Apply a named filter to a canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @param {string} filterName  — key from FILTERS
 */
function applyFilter(ctx, width, height, filterName) {
  const fn = FILTERS[filterName];
  if (!fn) return;
  const imgData = ctx.getImageData(0, 0, width, height);
  fn(imgData.data);
  ctx.putImageData(imgData, 0, 0);
}

// CSS filter strings for the live video preview (approximate match)
const FILTER_CSS = {
  none:      'none',
  grayscale: 'grayscale(100%)',
  sepia:     'sepia(100%)',
  vivid:     'saturate(190%) contrast(108%)',
  cool:      'hue-rotate(20deg) saturate(115%)',
};
