'use client';

import { useMemo, useState } from 'react';
import type { CatalogEntryRow, CatalogGraphData } from '@/lib/repositories/catalog.repo';
import { useCatalogGraph } from '@/hooks/use-catalog';
import { Skeleton } from '@siza/ui';

const TYPE_COLORS: Record<string, { fill: string; stroke: string }> = {
  domain: { fill: '#7c3aed', stroke: '#a78bfa' },
  system: { fill: '#3b82f6', stroke: '#93c5fd' },
  service: { fill: '#06b6d4', stroke: '#67e8f9' },
  component: { fill: '#10b981', stroke: '#6ee7b7' },
  api: { fill: '#8b5cf6', stroke: '#c4b5fd' },
  library: { fill: '#f59e0b', stroke: '#fcd34d' },
  website: { fill: '#ec4899', stroke: '#f9a8d4' },
};

const NODE_W = 160;
const NODE_H = 48;
const COL_GAP = 220;
const ROW_GAP = 72;
const PAD = 40;

interface LayoutNode {
  id: string;
  entry: CatalogEntryRow;
  x: number;
  y: number;
}

function layoutGraph(graph: CatalogGraphData) {
  const typeOrder = ['domain', 'system', 'service', 'component', 'api', 'library', 'website'];
  const byType = new Map<string, CatalogEntryRow[]>();
  for (const node of graph.nodes) {
    const list = byType.get(node.type) || [];
    list.push(node);
    byType.set(node.type, list);
  }

  const layoutNodes: LayoutNode[] = [];
  let col = 0;
  let maxRow = 0;

  for (const type of typeOrder) {
    const entries = byType.get(type);
    if (!entries || entries.length === 0) continue;
    for (let row = 0; row < entries.length; row++) {
      layoutNodes.push({
        id: entries[row].id,
        entry: entries[row],
        x: PAD + col * COL_GAP,
        y: PAD + row * ROW_GAP,
      });
      maxRow = Math.max(maxRow, row);
    }
    col++;
  }

  return {
    nodes: layoutNodes,
    width: PAD * 2 + Math.max(col, 1) * COL_GAP,
    height: PAD * 2 + (maxRow + 1) * ROW_GAP,
  };
}

export function DependencyGraph() {
  const { data: graph, isLoading } = useCatalogGraph();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const layout = useMemo(() => {
    if (!graph) return null;
    return layoutGraph(graph);
  }, [graph]);

  const connectedIds = useMemo(() => {
    if (!hoveredId || !graph)
      return new Set<string>(graph?.nodes.map((n: CatalogEntryRow) => n.id) || []);
    const ids = new Set<string>([hoveredId]);
    for (const edge of graph.edges) {
      if (edge.source === hoveredId) ids.add(edge.target);
      if (edge.target === hoveredId) ids.add(edge.source);
    }
    return ids;
  }, [hoveredId, graph]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-surface-3 bg-surface-1 p-6">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!layout || layout.nodes.length === 0) {
    return (
      <div className="rounded-xl border border-surface-3 bg-surface-1 p-8 text-center">
        <p className="text-sm text-text-secondary">No catalog entries to visualize</p>
      </div>
    );
  }

  const nodeMap = new Map(layout.nodes.map((n: LayoutNode) => [n.id, n]));

  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 overflow-auto">
      <div className="flex items-center gap-4 px-5 py-3 border-b border-surface-3">
        <h3 className="text-sm font-semibold text-text-primary">Dependency Graph</h3>
        <div className="flex items-center gap-3 ml-auto flex-wrap">
          {Object.entries(TYPE_COLORS).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors.stroke }} />
              <span className="text-[10px] text-text-muted capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
      <svg
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="min-w-full"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
          </marker>
        </defs>
        {graph?.edges.map((edge: { source: string; target: string; type: string }, i: number) => {
          const source = nodeMap.get(edge.source);
          const target = nodeMap.get(edge.target);
          if (!source || !target) return null;
          const highlighted = connectedIds.has(edge.source) && connectedIds.has(edge.target);
          const midX = (source.x + NODE_W + target.x) / 2;
          const color = edge.type === 'hierarchy' ? '#7c3aed' : '#6b7280';
          return (
            <path
              key={i}
              d={`M ${source.x + NODE_W} ${source.y + NODE_H / 2} C ${midX} ${source.y + NODE_H / 2}, ${midX} ${target.y + NODE_H / 2}, ${target.x} ${target.y + NODE_H / 2}`}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray={edge.type === 'dependency' ? '4,4' : 'none'}
              opacity={highlighted ? 0.8 : 0.15}
              style={{ transition: 'opacity 0.2s' }}
              markerEnd="url(#arrow)"
            />
          );
        })}
        {layout.nodes.map((node: LayoutNode) => {
          const colors = TYPE_COLORS[node.entry.type] || TYPE_COLORS.service;
          const opacity = connectedIds.has(node.id) ? 1 : 0.4;
          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: 'pointer', opacity, transition: 'opacity 0.2s' }}
            >
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={8}
                fill={colors.fill}
                fillOpacity={0.15}
                stroke={colors.stroke}
                strokeWidth={1.5}
              />
              <text x={12} y={20} fill={colors.stroke} fontSize={12} fontWeight={600}>
                {node.entry.display_name.length > 18
                  ? node.entry.display_name.slice(0, 16) + '...'
                  : node.entry.display_name}
              </text>
              <text x={12} y={36} fill="#9ca3af" fontSize={10} fontFamily="monospace">
                {node.entry.type}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
