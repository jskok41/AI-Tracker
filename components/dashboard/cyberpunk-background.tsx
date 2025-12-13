'use client';

import { useEffect, useRef } from 'react';

export function CyberpunkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Grid pattern settings
    const gridSize = 50;
    const lineColor = 'rgba(0, 255, 65, 0.1)';
    const pulseColor = 'rgba(0, 255, 65, 0.3)';
    let animationFrame: number;
    let time = 0;

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Animated pulse effect
      time += 0.02;
      const pulseX = (Math.sin(time) * 0.5 + 0.5) * canvas.width;
      const pulseY = (Math.cos(time * 0.7) * 0.5 + 0.5) * canvas.height;

      // Draw pulsing circles
      for (let i = 0; i < 3; i++) {
        const offset = (time + i * 2) * 0.5;
        const x = (Math.sin(offset) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(offset * 0.8) * 0.5 + 0.5) * canvas.height;
        const radius = (Math.sin(time + i) * 0.5 + 0.5) * 100 + 50;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, pulseColor);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw circuit-like connections
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const startX = (Math.sin(time + i) * 0.5 + 0.5) * canvas.width;
        const startY = (Math.cos(time + i * 0.7) * 0.5 + 0.5) * canvas.height;
        const endX = (Math.sin(time + i + 1) * 0.5 + 0.5) * canvas.width;
        const endY = (Math.cos(time + i * 0.7 + 1) * 0.5 + 0.5) * canvas.height;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      animationFrame = requestAnimationFrame(drawGrid);
    };

    drawGrid();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: '#050505' }}
    />
  );
}
