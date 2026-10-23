import type { SVGProps } from 'react';
import { appearance, type Appearance } from './appearance';
import { DocumentLookupArtwork } from './icons/DocumentLookupArtwork';

const paths = {
  plus: 'M12 5v14M5 12h14',
  close: 'm6 6 12 12M6 18 18 6',
  down: 'm6 9 6 6 6-6',
  left: 'm14 6-6 6 6 6',
  right: 'm10 6 6 6-6 6',
  search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2ZM7 3v6h10V3M7 21v-8h10v8',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
  print: 'M6 9V3h12v6M6 18H3V9h18v9h-3M6 14h12v7H6v-7M17 11h1',
  file: 'M14 2H5v20h14V7l-5-5Zm0 0v6h5M8 12h8M8 16h6',
  folder: 'M3 20V5h6l2 3h10v12H3ZM3 11h18',
  check: 'm5 12 4 4L19 6',
  info: 'M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  cart: 'M3 3h2l3 12h11l2-8H6M10 20h.01M18 20h.01',
  bank: 'm2 8 10-6 10 6H2ZM4 11v7M9 11v7M15 11v7M20 11v7M2 22h20',
  box: 'm3 6 9-4 9 4v12l-9 4-9-4V6Zm0 0 9 4 9-4M12 10v12M7 4l10 4',
  clock: 'M12 6v6l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  copy: 'M8 8h13v13H8V8ZM16 8V3H3v13h5',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  help: 'M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 3M12 17h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
} as const;
export type IconName = keyof typeof paths | 'document-lookup';
export interface IconProps
  extends Omit<SVGProps<SVGSVGElement>, 'color' | 'width' | 'height'>, Appearance {
  name: IconName;
  size?: number;
}
export function Icon({
  name,
  size = 16,
  width = size,
  height = size,
  color,
  backgroundColor,
  style,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox={name === 'document-lookup' ? '0 0 16 16' : '0 0 24 24'}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={appearance({ width, height, color, backgroundColor, style })}
      {...props}
    >
      {name === 'document-lookup' ? <DocumentLookupArtwork /> : <path d={paths[name]} />}
    </svg>
  );
}
