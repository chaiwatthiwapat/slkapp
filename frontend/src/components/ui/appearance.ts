import type { CSSProperties } from 'react';

export type Tone = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
export interface Appearance {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  color?: CSSProperties['color'];
  backgroundColor?: CSSProperties['backgroundColor'];
  style?: CSSProperties;
}
export function appearance({
  width,
  height,
  color,
  backgroundColor,
  style,
}: Appearance): CSSProperties {
  return { width, height, color, backgroundColor, ...style };
}
