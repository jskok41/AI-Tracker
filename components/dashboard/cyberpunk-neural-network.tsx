'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NeuralNetworkProps {
  categories: Array<{
    category: string;
    count: number;
    subCategories?: Array<{
      subCategory: string;
      count: number;
    }>;
  }>;
  className?: string;
}

export function CyberpunkNeuralNetwork({ categories, className }: NeuralNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

    useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 200, // Reduced height for better balance
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

  // Sort categories by count
  const sortedCategories = [...categories].sort((a, b) => b.count - a.count);
  const total = categories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Neural Network Visualization - Reduced height for better balance */}
      <div ref={containerRef} className="relative w-full" style={{ height: '200px' }}>
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ background: 'transparent' }}
        />
      </div>
      
      {/* Category List with Expandable Breakdown */}
      <div className="space-y-1.5">
        {sortedCategories.map((category) => {
          const percentage = total > 0 ? ((category.count / total) * 100).toFixed(1) : '0';
          const subCategories = category.subCategories || [];
          const hasSubCategories = subCategories.length > 0;
          const isExpanded = expandedCategories.has(category.category);
          
          return (
            <div key={category.category} className="space-y-1">
              {/* Category Row */}
              <div 
                className={cn(
                  "flex items-center justify-between group",
                  hasSubCategories && "cursor-pointer hover:bg-[#00FF41]/5 rounded px-1 py-0.5 transition-colors"
                )}
                onClick={() => hasSubCategories && toggleCategory(category.category)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {hasSubCategories && (
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-[#00FF41]/70" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-[#00FF41]/70" />
                      )}
                    </div>
                  )}
                  <div 
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ 
                      backgroundColor: '#00FF41',
                      boxShadow: '0 0 8px #00FF41',
                    }}
                  />
                  <span className="text-sm capitalize text-white">
                    {category.category.toLowerCase().replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-[#00FF41]/70">{percentage}%</span>
                  <span className="text-sm font-medium text-white">{category.count}</span>
                </div>
              </div>
              
              {/* Department & Team Breakdown */}
              {hasSubCategories && isExpanded && (
                <div className="ml-6 space-y-1 border-l border-[#00FF41]/20 pl-3">
                  {subCategories
                    .sort((a, b) => b.count - a.count)
                    .map((subCategory) => {
                      const subPercentage = category.count > 0 ? ((subCategory.count / category.count) * 100).toFixed(1) : '0';
                      return (
                        <div
                          key={subCategory.subCategory}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#00FF41]/60 flex-shrink-0" />
                            <span className="text-xs text-[#00FF41]/80 truncate">
                              {subCategory.subCategory || 'Unspecified'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-[#00FF41]/60">{subPercentage}%</span>
                            <span className="text-xs font-medium text-white">
                              {subCategory.count}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
