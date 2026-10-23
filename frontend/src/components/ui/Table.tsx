import type { CSSProperties, Key, ReactNode } from 'react';
import { appearance, type Appearance } from './appearance';

export interface Column<T> {
  key: string;
  title: ReactNode;
  width?: CSSProperties['width'];
  align?: 'left' | 'center' | 'right';
  render: (row: T, index: number) => ReactNode;
}
export interface TableProps<T> extends Appearance {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => Key;
  label: string;
  className?: string;
  minWidth?: CSSProperties['minWidth'];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}
export function Table<T>({
  columns,
  rows,
  rowKey,
  label,
  className = '',
  minWidth,
  emptyMessage = 'ไม่พบข้อมูล',
  onRowClick,
  ...visual
}: TableProps<T>) {
  return (
    <div
      className={`ui-table-scroll ${className}`}
      style={appearance(visual)}
      tabIndex={0}
      role="region"
      aria-label={label}
    >
      <table className="ui-table" style={{ minWidth }}>
        <caption className="sr-only">{label}</caption>
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={{ width: column.width }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((column) => (
              <th scope="col" key={column.key} style={{ textAlign: column.align }}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={rowKey(row)} onClick={onRowClick ? () => onRowClick(row) : undefined}>
                {columns.map((column) => (
                  <td key={column.key} style={{ textAlign: column.align }}>
                    {column.render(row, index)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
