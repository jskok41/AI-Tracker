'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CategoryChartProps {
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

const NEON_GREEN = '#39ff14';

export function CategoryChart({
  categories,
  className,
}: CategoryChartProps) {
  const primaryColor = NEON_GREEN;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);
  
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
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
    ctx.scale(dpr, dpr);

    // Initialize network nodes based on categories
    // Position nodes in the right 2/3 of the canvas (left 1/3 is for list)
    const listWidth = dimensions.width / 3;
    const graphStartX = listWidth;
    const graphWidth = dimensions.width - listWidth;
    const nodes: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      connections: number[];
      category: string;
      count: number;
    }> = [];

    // Create nodes proportional to category counts, positioned in right 2/3
    categories.forEach((category) => {
      const nodeCount = Math.max(3, Math.round((category.count / totalCount) * 30));
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: graphStartX + Math.random() * graphWidth,
          y: Math.random() * dimensions.height,
          radius: Math.random() * 3 + 2,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          connections: [],
          category: category.category,
          count: category.count,
        });
      }
    });

    // Calculate connections
    const maxDistance = 150;
    nodes.forEach((node, i) => {
      nodes.forEach((otherNode, j) => {
        if (i !== j && node.category === otherNode.category) {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < maxDistance) {
            node.connections.push(j);
          }
        }
      });
    });

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Update positions (keep nodes in right 2/3 area)
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < graphStartX || node.x > dimensions.width) node.vx *= -1;
        if (node.y < 0 || node.y > dimensions.height) node.vy *= -1;

        node.x = Math.max(graphStartX, Math.min(dimensions.width, node.x));
        node.y = Math.max(0, Math.min(dimensions.height, node.y));
      });

      // Draw connections
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 0.5;
      nodes.forEach((node) => {
        const isHovered = hoveredCategory === node.category;
        node.connections.forEach((connectionIndex) => {
          const connectedNode = nodes[connectionIndex];
          const dx = node.x - connectedNode.x;
          const dy = node.y - connectedNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * (isHovered ? 0.5 : 0.3);
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(connectedNode.x, connectedNode.y);
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      ctx.globalAlpha = 1;
      nodes.forEach((node) => {
        const isHovered = hoveredCategory === node.category;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          node.radius * 3
        );
        gradient.addColorStop(0, isHovered ? 'rgba(57, 255, 20, 0.9)' : 'rgba(57, 255, 20, 0.8)');
        gradient.addColorStop(0.5, isHovered ? 'rgba(57, 255, 20, 0.4)' : 'rgba(57, 255, 20, 0.3)');
        gradient.addColorStop(1, 'rgba(57, 255, 20, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Node
        ctx.fillStyle = primaryColor;
        ctx.shadowBlur = isHovered ? 15 : 10;
        ctx.shadowColor = primaryColor;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, categories, hoveredCategory, primaryColor, totalCount]);

  // Sort categories by count
  const sortedCategories = [...categories].sort((a, b) => b.count - a.count);

  return (
    <div className={cn('relative w-full h-full min-h-[500px]', className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'transparent' }}
      />
      
      {/* Category List Overlay - Left Side */}
      <div className="absolute left-4 top-4 bottom-4 w-1/3 z-10 overflow-y-auto pointer-events-auto">
        <div className="space-y-2 pr-4">
          {sortedCategories.map((category) => {
            const subCategories = category.subCategories || [];
            const hasSubCategories = subCategories.length > 0;
            const isExpanded = expandedCategories.has(category.category);
            const categoryPercentage = totalCount > 0 ? ((category.count / totalCount) * 100).toFixed(1) : '0';
            
            return (
              <div
                key={category.category}
                className="space-y-1.5"
                onMouseEnter={() => setHoveredCategory(category.category)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {/* Category Row */}
                <div className="flex items-center justify-between group cursor-pointer" onClick={() => hasSubCategories && toggleCategory(category.category)}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {hasSubCategories && (
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    )}
                    <div
                      className="h-2.5 w-2.5 rounded-full transition-all flex-shrink-0"
                      style={{
                        backgroundColor: primaryColor,
                        boxShadow: hoveredCategory === category.category
                          ? `0 0 10px ${primaryColor}`
                          : `0 0 6px ${primaryColor}`,
                        transform: hoveredCategory === category.category ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                    <span className="text-sm font-semibold capitalize transition-colors text-white group-hover:text-neon-green truncate">
                      {category.category.toLowerCase().replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">{categoryPercentage}%</span>
                    <span className="text-sm font-bold text-neon-green">{category.count}</span>
                  </div>
                </div>
                
                {/* Sub-Category Rows */}
                {hasSubCategories && isExpanded && (
                  <div className="ml-6 space-y-1.5 border-l-2 border-neon-green/30 pl-3 mt-1">
                    {subCategories
                      .sort((a, b) => b.count - a.count)
                      .map((subCategory) => {
                        const subPercentage = category.count > 0 ? ((subCategory.count / category.count) * 100).toFixed(1) : '0';
                        return (
                          <div
                            key={subCategory.subCategory}
                            className="flex items-center justify-between group/sub"
                            onMouseEnter={() => setHoveredCategory(category.category)}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="h-1.5 w-1.5 rounded-full bg-neon-green/60 flex-shrink-0" />
                              <span className="text-xs text-gray-300 truncate group-hover/sub:text-neon-green transition-colors">
                                {subCategory.subCategory || 'Unspecified'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-gray-500">{subPercentage}%</span>
                              <span className="text-xs font-semibold text-gray-400 ml-1">
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

      {/* Network Graph fills remaining space - rendered via canvas */}
    </div>
  );
}
