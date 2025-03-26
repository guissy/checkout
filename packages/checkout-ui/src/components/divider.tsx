import { cn } from '@/lib/utils';
import React from 'react';

type DividerProps = {
  className?: string;
  width?: number | string;
  thickness?: number;
  dashColor?: string;
  dashLength?: number;
  gapLength?: number;
  margin?: string;
};

const Divider: React.FC<DividerProps> = ({
                                           className,
                                           thickness = 1,
                                           dashColor = '#CCCFD5',
                                           dashLength = 4,
                                           gapLength = 4,
                                         }) => {
  const backgroundStyle = {
    backgroundImage: `repeating-linear-gradient(
      to right,
      ${dashColor} 0,
      ${dashColor} ${dashLength}px,
      transparent ${dashLength}px,
      transparent ${dashLength + gapLength}px
    )`,
    height: thickness,
  };

  return (
    <div
      role="separator"
      className={cn('max-w-full overflow-hidden', className)}
      style={backgroundStyle}
    />
  );
};

export default Divider;
