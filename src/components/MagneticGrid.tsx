import { useEffect, useRef, useCallback } from "react";

interface Props {
  lineCount?: number;
  repulsionRadius?: number;
  maxDisplacement?: number;
  damping?: number;
  className?: string;
}

export function MagneticGrid({
  lineCount = 24,
  repulsionRadius = 160,
  maxDisplacement = 50,
  damping = 0.12,
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const offsetsRef = useRef<number[][]>([]);
  const frameRef = useRef(0);

  const initGrid = useCallback(
    (w: number, h: number) => {
      const spacingX = w / lineCount;
      const spacingY = h / lineCount;
      const cols = Math.floor(w / spacingX) + 1;
      const rows = Math.floor(h / spacingY) + 1;
      const grid: number[][] = [];
      for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
          grid[r][c] = 0;
        }
      }
      offsetsRef.current = grid;
      return { spacingX, spacingY, cols, rows };
    },
    [lineCount]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + "px";
      canvas!.style.height = window.innerHeight + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const { spacingX, spacingY, cols, rows } = initGrid(
      window.innerWidth,
      window.innerHeight
    );

    function onMouse(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }
    function onLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
    }
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseleave", onLeave);

    let running = true;

    function draw() {
      if (!running) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx!.clearRect(0, 0, w, h);

      const accent = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() || "#00D4FF";

      const off = offsetsRef.current;

      for (let r = 0; r < rows; r++) {
        const baseY = r * spacingY;
        for (let c = 0; c < cols; c++) {
          const baseX = c * spacingX;
          const dx = baseX - mx;
          const dy = baseY - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let target = 0;
          if (dist < repulsionRadius && dist > 0) {
            const force = (1 - dist / repulsionRadius);
            const angle = Math.atan2(dy, dx);
            target = force * maxDisplacement;
            off[r][c] += (target * Math.cos(angle) - off[r][c]) * damping;
          } else {
            off[r][c] *= 1 - damping * 0.5;
          }
          if (Math.abs(off[r][c]) < 0.01) off[r][c] = 0;
        }
      }

      ctx!.strokeStyle = accent + "18";
      ctx!.lineWidth = 0.5;

      ctx!.beginPath();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacingX + off[r][c];
          const y = r * spacingY;
          if (c === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
      }
      ctx!.stroke();

      ctx!.beginPath();
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = c * spacingX + off[r][c];
          const y = r * spacingY;
          if (r === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
      }
      ctx!.stroke();

      const active = mx > 0 && mx < w && my > 0 && my < h;
      if (active) {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const disp = Math.abs(off[r][c]);
            if (disp > 2) {
              const x = c * spacingX + off[r][c];
              const y = r * spacingY;
              const alpha = Math.min(disp / maxDisplacement, 0.8);
              const radius = 1.5 + disp * 0.08;
              ctx!.beginPath();
              ctx!.arc(x, y, radius, 0, Math.PI * 2);
              ctx!.fillStyle = accent + Math.floor(alpha * 40).toString(16).padStart(2, "0");
              ctx!.fill();
            }
          }
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [initGrid, repulsionRadius, maxDisplacement, damping]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0, opacity: 0.6 }}
    />
  );
}
