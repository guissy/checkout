import type { FC } from 'react';
import clsx from 'clsx';

const Arrow: FC<{ direction: 'left' | 'right' | 'up' | 'down', className?: string }> = ({ className, direction }) => {
    return (
      <svg width="11" height="7" viewBox="0 0 11 7" fill="none" xmlns="http://www.w3.org/2000/svg"
           className={clsx('transform',
             direction === 'left' && '-rotate-90 -translate-y-px',
             direction === 'down' && 'rotate-180',
             direction === 'right' && 'rotate-90 translate-y-px', className)}>
        <path d="M5 1.815 1.219 5.78a.687.687 0 0 1-1.008 0 .77.77 0 0 1 0-1.057L4.395.336A.656.656 0 0 1 4.486.22.679.679 0 0 1 5.001 0a.707.707 0 0 1 .605.336l4.185 4.387a.767.767 0 0 1 .209.529.767.767 0 0 1-.209.528.687.687 0 0 1-1.008 0L5.001 1.815z" fill="currentColor"/>
      </svg>
    )
}

export default Arrow;
