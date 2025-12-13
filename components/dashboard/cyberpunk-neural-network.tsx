'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface NeuralNetworkProps {
  categories: Array<{
    category: string;
    count: number;
  }>;
  className?: string;
}

export function CyberpunkNeuralNetwork({ categories, className }: NeuralNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 300,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || categories.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);
    const nodeColor = '#00FF41';
    const connectionColor = 'rgba(0, 255, 65, 0.3)';

    // Create nodes for each category
    interface Node {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      category: string;
      count: number;
      connections: Array<{ target: number; distance: number }>;
    }
    
    const nodes: Node[] = [];

    categories.forEach((category, index) => {
      const nodeCount = Math.max(3, Math.round((category.count / totalCount) * 15));
      const baseAngle = (index / categories.length) * Math.PI * 2;
      const baseRadius = Math.min(dimensions.width, dimensions.height) * 0.3;
      
      for (let i = 0; i < nodeCount; i++) {
        const angle = baseAngle + (i / nodeCount) * 0.5;
        const radius = baseRadius + Math.random() * 30;
        nodes.push({
          x: dimensions.width / 2 + Math.cos(angle) * radius,
          y: dimensions.height / 2 + Math.sin(angle) * radius,
          radius: Math.random() * 3 + 2,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          category: category.category,
          count: category.count,
          connections: [],
        });
      }
    });

    // Calculate connections
    const maxDistance = 80;
    nodes.forEach((node, i) => {
      nodes.forEach((otherNode, j) => {
        if (i !== j && node.category === otherNode.category) {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < maxDistance) {
            node.connections.push({ target: j, distance });
          }
        }
      });
    });

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Update node positions
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < node.radius || node.x > dimensions.width - node.radius) {
          node.vx *= -1;
        }
        if (node.y < node.radius || node.y > dimensions.height - node.radius) {
          node.vy *= -1;
        }

        // Keep nodes in bounds
        node.x = Math.max(node.radius, Math.min(dimensions.width - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(dimensions.height - node.radius, node.y));
      });

      // Draw connections
      ctx.strokeStyle = connectionColor;
      ctx.lineWidth = 1;
      nodes.forEach((node) => {
        node.connections.forEach((conn) => {
          const target = nodes[conn.target];
          if (target) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
          }
        });
      });

      // Draw nodes with glow effect
      time += 0.02;
      nodes.forEach((node, i) => {
        const pulse = Math.sin(time + i) * 0.3 + 0.7;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * 3
        );
        gradient.addColorStop(0, `rgba(0, 255, 65, ${0.6 * pulse})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Node
        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [dimensions, categories]);

  return (
    <div className={cn('space-y-4', className)}>
      <div ref={containerRef} className="relative w-full">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ background: 'transparent' }}
        />
      </div>
      
      {/* Category List */}
      <div className="space-y-2">
        {categories.map((category) => {
          const total = categories.reduce((sum, cat) => sum + cat.count, 0);
          const percentage = total > 0 ? ((category.count / total) * 100).toFixed(1) : '0';
          
          return (
            <div key={category.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="h-2 w-2 rounded-full"
                  style={{ 
                    backgroundColor: '#00FF41',
                    boxShadow: '0 0 8px #00FF41',
                  }}
                />
                <span className="text-sm capitalize text-white">
                  {category.category.toLowerCase().replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#00FF41]/70">{percentage}%</span>
                <span className="text-sm font-medium text-white">{category.count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
