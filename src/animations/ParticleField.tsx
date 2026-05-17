import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

export function ParticleField({ count = 100 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let width = canvas.width = canvas.clientWidth * devicePixelRatio;
    let height = canvas.height = canvas.clientHeight * devicePixelRatio;

    function initParticles() {
      particlesRef.current = Array.from({ length: count }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.5 + 0.5,
      }));
    }

    function resize() {
      width = canvas.width = canvas.clientWidth * devicePixelRatio;
      height = canvas.height = canvas.clientHeight * devicePixelRatio;
      initParticles();
    }

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);
    resize();

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // draw particles
      for (const p of particlesRef.current) {
        p.x += p.vx * devicePixelRatio;
        p.y += p.vy * devicePixelRatio;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.fillStyle = 'rgba(0,245,255,0.08)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      }

      // draw connections
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 * devicePixelRatio) {
            const alpha = 1 - dist / (120 * devicePixelRatio);
            ctx.strokeStyle = `rgba(0,245,255,${0.06 * alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
