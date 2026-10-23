import type { ButtonHTMLAttributes } from 'react';
import { appearance, type Appearance, type Tone } from './appearance';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>, Appearance {
  tone?: Tone;
  variant?: 'solid' | 'soft' | 'outline' | 'ghost';
}
export function Button({
  tone = 'primary',
  variant = 'outline',
  width,
  height,
  color,
  backgroundColor,
  style,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`ui-button tone-${tone} variant-${variant} ${className}`}
      style={appearance({ width, height, color, backgroundColor, style })}
      {...props}
    />
  );
}
