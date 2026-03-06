import React from 'react';

type Cols = {
  base?: number;
  md?: number;
  lg?: number;
};

type StatsGridProps = {
  children: React.ReactNode;
  cols?: Cols;
  gapClassName?: string;
  className?: string;
};

export function StatsGrid({ children, cols, gapClassName = 'gap-6', className = '' }: StatsGridProps) {
  const base = cols?.base ?? 1;
  const md = cols?.md ?? 2;
  const lg = cols?.lg ?? 4;

  const baseMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };
  const mdMap: Record<number, string> = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
  };
  const lgMap: Record<number, string> = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
  };

  const grid = ['grid', baseMap[base] || baseMap[1], mdMap[md] || mdMap[2], lgMap[lg] || lgMap[4], gapClassName, className]
    .filter(Boolean)
    .join(' ')
    .trim();

  return <div className={grid}>{children}</div>;
}

type StatCardProps = {
  title?: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  meta?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export function StatCard({ title, value, icon, meta, footer, className = '', children }: StatCardProps) {
  if (children) {
    return <div className={`card p-6 ${className}`.trim()}>{children}</div>;
  }
  return (
    <div className={`card p-6 ${className}`.trim()}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-900 dark:text-white">{icon}</div>
        {meta ? <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{meta}</span> : <span className="text-xs opacity-0">.</span>}
      </div>
      {title ? <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-400 mb-1">{title}</p> : null}
      {value ? <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3> : null}
      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}

export default StatsGrid;
