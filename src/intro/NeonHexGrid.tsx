import React, { useRef, useEffect, useCallback } from 'react';

// Configuration constants from the original JS
const HEX_CRAD = 32;
const HEX_BG = '#171717';
const HEX_HL = '#2a2a2a';
const HEX_HLW = 2;
const HEX_GAP = 4;
const NEON_PALETE = [
  '#cb3301', '#ff0066', '#ff6666', '#feff99',
  '#ffff67', '#ccff66', '#99fe00', '#fe99ff',
  '#ff99cb', '#fe349a', '#cc99fe', '#6599ff',
  '#00ccff', '#ffffff'
];
const T_SWITCH = 64;

// Helper classes for grid generation
class GridItem {
  x: number;
  y: number;
  points: { hex: { x: number; y: number }[]; hl: { x: number; y: number }[] };

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.points = { hex: [], hl: [] };
    this.init();
  }

  init() {
    const ba = Math.PI / 3;
    const ri = HEX_CRAD - 0.5 * HEX_HLW;

    for (let i = 0; i < 6; i++) {
      const a = i * ba;
      const x = this.x + HEX_CRAD * Math.cos(a);
      const y = this.y + HEX_CRAD * Math.sin(a);
      this.points.hex.push({ x, y });

      if (i > 2) {
        const hx = this.x + ri * Math.cos(a);
        const hy = this.y + ri * Math.sin(a);
        this.points.hl.push({ x: hx, y: hy });
      }
    }
  }

  draw(ct: CanvasRenderingContext2D) {
    for (let i = 0; i < 6; i++) {
      ct[i === 0 ? 'moveTo' : 'lineTo'](this.points.hex[i].x, this.points.hex[i].y);
    }
  }

  highlight(ct: CanvasRenderingContext2D) {
    for (let i = 0; i < 3; i++) {
      ct[i === 0 ? 'moveTo' : 'lineTo'](this.points.hl[i].x, this.points.hl[i].y);
    }
  }
}

class Grid {
  cols: number;
  rows: number;
  items: GridItem[] = [];
  n: number;

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.init();
    this.n = this.items.length;
  }

  init() {
    const unit_y = HEX_CRAD * Math.sqrt(3) * 0.5 + 0.5 * HEX_GAP;
    const unit_x = 3 * HEX_CRAD + HEX_GAP * Math.sqrt(3);
    const off_x = 1.5 * HEX_CRAD + HEX_GAP * Math.sqrt(3) * 0.5;

    for (let row = 0; row < this.rows; row++) {
      const y = row * unit_y;
      for (let col = 0; col < this.cols; col++) {
        const x = (row % 2 === 0 ? 0 : off_x) + col * unit_x;
        this.items.push(new GridItem(x, y));
      }
    }
    this.n = this.items.length;
  }

  draw(ct: CanvasRenderingContext2D) {
    ct.fillStyle = HEX_BG;
    ct.beginPath();
    this.items.forEach(item => item.draw(ct));
    ct.closePath();
    ct.fill();

    ct.strokeStyle = HEX_HL;
    ct.lineWidth = HEX_HLW;
    ct.beginPath();
    this.items.forEach(item => item.highlight(ct));
    ct.closePath();
    ct.stroke();
  }
}

// The React Component
export const NeonHexGrid: React.FC = () => {
  const foregroundRef = useRef<HTMLCanvasElement>(null);
  const backgroundRef = useRef<HTMLCanvasElement>(null);
  
  // Using refs to store mutable values that don't trigger re-renders
  const animationFrameId = useRef<number>();
  const source = useRef<{ x: number; y: number } | null>(null);
  const t = useRef(0);
  const csi = useRef(0);
  
  // Converted color palette
  const wp = NEON_PALETE.map(c => {
    const num = parseInt(c.replace('#', ''), 16);
    return { r: (num >> 16) & 0xff, g: (num >> 8) & 0xff, b: num & 0xff };
  });
  const nwp = wp.length;
  const f = 1 / T_SWITCH;

  const fillBackground = useCallback((ctx: CanvasRenderingContext2D, bg_fill: string | CanvasGradient) => {
    ctx.fillStyle = bg_fill;
    ctx.beginPath();
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.closePath();
    ctx.fill();
  }, []);

  const neon = useCallback(() => {
    const fgCtx = foregroundRef.current?.getContext('2d');
    if (!fgCtx || !source.current) {
      animationFrameId.current = requestAnimationFrame(neon);
      return;
    }

    const _min = 0.75 * Math.min(fgCtx.canvas.width, fgCtx.canvas.height);
    const k = (t.current % T_SWITCH) * f;
    const current_csi = csi.current;

    const rgb = {
      r: Math.floor(wp[current_csi].r * (1 - k) + wp[(current_csi + 1) % nwp].r * k),
      g: Math.floor(wp[current_csi].g * (1 - k) + wp[(current_csi + 1) % nwp].g * k),
      b: Math.floor(wp[current_csi].b * (1 - k) + wp[(current_csi + 1) % nwp].b * k),
    };
    const rgb_str = `rgb(${rgb.r},${rgb.g},${rgb.b})`;

    const light = fgCtx.createRadialGradient(
      source.current.x, source.current.y, 0,
      source.current.x, source.current.y, 0.875 * _min
    );
    
    const stp = 0.5 - 0.5 * Math.sin(7 * t.current * f) * Math.cos(5 * t.current * f) * Math.sin(3 * t.current * f);
    
    light.addColorStop(0, rgb_str);
    light.addColorStop(stp, 'rgba(0,0,0,.03)');

    fillBackground(fgCtx, 'rgba(0,0,0,.02)');
    fillBackground(fgCtx, light);

    t.current++;
    if (t.current % T_SWITCH === 0) {
      csi.current++;
      if (csi.current === nwp) {
        csi.current = 0;
        t.current = 0;
      }
    }
    
    animationFrameId.current = requestAnimationFrame(neon);
  }, [fillBackground, f, nwp, wp]);

  useEffect(() => {
    const fgCanvas = foregroundRef.current;
    const bgCanvas = backgroundRef.current;
    const fgCtx = fgCanvas?.getContext('2d');
    const bgCtx = bgCanvas?.getContext('2d');

    if (!fgCanvas || !bgCanvas || !fgCtx || !bgCtx) return;

    const init = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      fgCanvas.width = w;
      fgCanvas.height = h;
      bgCanvas.width = w;
      bgCanvas.height = h;

      const unit_y = HEX_CRAD * Math.sqrt(3) * 0.5 + 0.5 * HEX_GAP;
      const unit_x = 3 * HEX_CRAD + HEX_GAP * Math.sqrt(3);

      const rows = Math.ceil(h / unit_y) + 2;
      const cols = Math.ceil(w / unit_x) + 2;

      const grid = new Grid(rows, cols);
      grid.draw(bgCtx);

      if (!source.current) {
        source.current = { x: Math.floor(w / 2), y: Math.floor(h / 2) };
      }
      
      // Cancel any existing animation frame
      if(animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      neon();
    };

    const handleMouseMove = (e: MouseEvent) => {
      source.current = { x: e.clientX, y: e.clientY };
    };

    init();
    window.addEventListener('resize', init);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [neon]);

  const canvasStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  };

  return (
    <>
      <canvas ref={foregroundRef} style={{...canvasStyle, zIndex: 0 }} />
      <canvas ref={backgroundRef} style={{...canvasStyle, zIndex: 1 }} />
    </>
  );
}; 