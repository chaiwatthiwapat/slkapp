import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { appearance, type Appearance } from './appearance';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'color' | 'width' | 'height'>, Appearance {
  invalid?: boolean;
}
export function Input({
  width,
  height,
  color,
  backgroundColor,
  style,
  className = '',
  invalid,
  ...props
}: InputProps) {
  return (
    <input
      className={`ui-input ${className}`}
      aria-invalid={invalid || undefined}
      style={appearance({ width, height, color, backgroundColor, style })}
      {...props}
    />
  );
}
export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'color'>, Appearance {}
export function Select({
  width,
  height,
  color,
  backgroundColor,
  style,
  className = '',
  ...props
}: SelectProps) {
  return (
    <select
      className={`ui-input ui-select ${className}`}
      style={appearance({ width, height, color, backgroundColor, style })}
      {...props}
    />
  );
}
interface FieldProps extends Appearance {
  label: string;
  required?: boolean;
  children: ReactNode | ((id: string) => ReactNode);
  className?: string;
  hint?: string;
}
export function Field({ label, required, children, className = '', hint, ...visual }: FieldProps) {
  const id = useId();
  return (
    <div className={`ui-field ${className}`} style={appearance(visual)}>
      <label htmlFor={typeof children === 'function' ? id : undefined}>
        {label}
        {required && (
          <span className="required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="field-control">
        {typeof children === 'function' ? children(id) : children}
      </div>
      {hint && <small>{hint}</small>}
    </div>
  );
}
