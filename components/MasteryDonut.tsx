import React, { useState } from 'react';
import { TopicItem } from '../types';
import { AlertCircle as AlertIcon, TrendingUp, CheckCircle, Star } from 'lucide-react';

interface Segment {
    id: 'WEAK' | 'AVERAGE' | 'STRONG' | 'EXCELLENT';
    label: string;
    color: string;
    light: string;
    text: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    count: number;
}

interface Props {
    topics: TopicItem[];
    activeFilter: 'WEAK' | 'AVERAGE' | 'STRONG' | 'EXCELLENT';
    onSelect: (id: 'WEAK' | 'AVERAGE' | 'STRONG' | 'EXCELLENT') => void;
}

export const MasteryDonut: React.FC<Props> = ({ topics, activeFilter, onSelect }) => {
    const [hovered, setHovered] = useState<Segment['id'] | null>(null);

    const counts = {
        WEAK: topics.filter(t => t.status === 'WEAK').length,
        AVERAGE: topics.filter(t => t.status === 'AVERAGE').length,
        STRONG: topics.filter(t => t.status === 'STRONG').length,
        EXCELLENT: topics.filter(t => t.status === 'EXCELLENT').length,
    };

    const segments: Segment[] = [
        { id: 'WEAK',      label: 'Weak',     color: '#ef4444', light: '#fee2e2', text: '#b91c1c', icon: AlertIcon,   count: counts.WEAK },
        { id: 'AVERAGE',   label: 'Average',  color: '#f59e0b', light: '#fef3c7', text: '#b45309', icon: TrendingUp,  count: counts.AVERAGE },
        { id: 'STRONG',    label: 'Strong',   color: '#22c55e', light: '#dcfce7', text: '#15803d', icon: CheckCircle, count: counts.STRONG },
        { id: 'EXCELLENT', label: 'Mastered', color: '#3b82f6', light: '#dbeafe', text: '#1d4ed8', icon: Star,        count: counts.EXCELLENT },
    ];

    const total = segments.reduce((sum, s) => sum + s.count, 0);

    // SVG geometry
    const SIZE = 220;
    const CENTER = SIZE / 2;
    const R_OUTER = 95;
    const R_INNER = 60;

    // Build pie/donut path for a segment given start/end angles (radians)
    const arcPath = (startAngle: number, endAngle: number, expanded: boolean): string => {
        const pad = expanded ? 6 : 0;
        const rOut = R_OUTER + (expanded ? 6 : 0);
        const rIn = Math.max(R_INNER - (expanded ? 0 : 0), 30);
        const x1 = CENTER + rOut * Math.cos(startAngle);
        const y1 = CENTER + rOut * Math.sin(startAngle);
        const x2 = CENTER + rOut * Math.cos(endAngle);
        const y2 = CENTER + rOut * Math.sin(endAngle);
        const x3 = CENTER + rIn * Math.cos(endAngle);
        const y3 = CENTER + rIn * Math.sin(endAngle);
        const x4 = CENTER + rIn * Math.cos(startAngle);
        const y4 = CENTER + rIn * Math.sin(startAngle);
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
        return `
            M ${x1} ${y1}
            A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2} ${y2}
            L ${x3} ${y3}
            A ${rIn} ${rIn} 0 ${largeArc} 0 ${x4} ${y4}
            Z
        `;
    };

    // EMPTY STATE — no topics yet
    if (total === 0) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center">
                <div className="relative w-[180px] h-[180px] mx-auto mb-4">
                    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full">
                        <circle cx={CENTER} cy={CENTER} r={R_OUTER} fill="#f1f5f9" />
                        <circle cx={CENTER} cy={CENTER} r={R_INNER} fill="#ffffff" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-3xl font-black text-slate-300">0</p>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Topics</p>
                    </div>
                </div>
                <h3 className="font-black text-slate-700 text-sm">No data yet</h3>
                <p className="text-xs text-slate-500 mt-1">Attempt some MCQs to start tracking your mastery.</p>
            </div>
        );
    }

    // Compute angles. Start from the top (-Math.PI / 2).
    let cursor = -Math.PI / 2;
    const arcs = segments.map(s => {
        const fraction = s.count / total;
        const startAngle = cursor;
        const endAngle = cursor + fraction * Math.PI * 2;
        cursor = endAngle;
        return { ...s, startAngle, endAngle, fraction };
    });

    const activeSeg = arcs.find(a => a.id === (hovered || activeFilter)) || arcs[0];

    return (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="font-black text-slate-800 text-base">Mastery Distribution</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tap a color to view list</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                    <p className="text-2xl font-black text-slate-800 leading-none">{total}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* DONUT */}
                <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
                    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full overflow-visible">
                        {arcs.map(a => {
                            if (a.count === 0) return null;
                            const isActive = activeFilter === a.id;
                            const isHover = hovered === a.id;
                            const expanded = isActive || isHover;
                            return (
                                <g key={a.id}>
                                    <path
                                        d={arcPath(a.startAngle, a.endAngle, expanded)}
                                        fill={a.color}
                                        opacity={hovered && hovered !== a.id ? 0.55 : 1}
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'all 0.25s ease',
                                            filter: expanded ? `drop-shadow(0 4px 8px ${a.color}66)` : 'none',
                                        }}
                                        onMouseEnter={() => setHovered(a.id)}
                                        onMouseLeave={() => setHovered(null)}
                                        onClick={() => onSelect(a.id)}
                                    />
                                </g>
                            );
                        })}
                        {/* center white circle */}
                        <circle cx={CENTER} cy={CENTER} r={R_INNER - 2} fill="#ffffff" pointerEvents="none" />
                    </svg>

                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: activeSeg.text }}>
                            {activeSeg.label}
                        </p>
                        <p className="text-4xl font-black leading-none" style={{ color: activeSeg.text }}>
                            {activeSeg.count}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">
                            {Math.round(activeSeg.fraction * 100)}% of topics
                        </p>
                    </div>
                </div>

                {/* LEGEND (also acts as buttons) */}
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 w-full">
                    {arcs.map(a => {
                        const isActive = activeFilter === a.id;
                        const Icon = a.icon;
                        return (
                            <button
                                key={a.id}
                                onClick={() => onSelect(a.id)}
                                onMouseEnter={() => setHovered(a.id)}
                                onMouseLeave={() => setHovered(null)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-left active:scale-95 ${isActive ? 'shadow-md' : 'hover:shadow-sm'}`}
                                style={{
                                    backgroundColor: isActive ? a.light : '#ffffff',
                                    borderColor: isActive ? a.color : '#e2e8f0',
                                }}
                            >
                                <div
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: a.color }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-wider truncate" style={{ color: a.text }}>
                                        {a.label}
                                    </p>
                                    <p className="text-xs font-black text-slate-700">{a.count} topic{a.count === 1 ? '' : 's'}</p>
                                </div>
                                <Icon size={14} className="shrink-0" />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
