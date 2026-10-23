import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { appearance, type Appearance } from './appearance';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Input } from './Input';
import type { LookupItem } from './Lookup';
import { Table, type Column } from './Table';

interface LookupDropdownProps<T extends LookupItem> extends Appearance {
  id?: string;
  label: string;
  value: string;
  items: readonly T[];
  onSelect: (item: T) => void;
  icon?: IconName;
  popupWidth?: CSSProperties['width'];
  disabled?: boolean;
}

export function LookupDropdown<T extends LookupItem>({
  id,
  label,
  value,
  items,
  onSelect,
  icon = 'document-lookup',
  popupWidth,
  disabled = false,
  width,
  height = 32,
  color,
  backgroundColor,
  style,
}: LookupDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const popupId = useId();
  const selected = items.find((item) => item.code === value);

  function focusInput() {
    root.current?.querySelector('input')?.focus();
  }
  function select(item: T) {
    onSelect(item);
    setOpen(false);
    focusInput();
  }

  useEffect(() => {
    if (!open) return;
    const buttons = popup.current?.querySelectorAll<HTMLButtonElement>('[data-lookup-option]');
    const index = Math.max(
      0,
      items.findIndex((item) => item.code === value),
    );
    buttons?.[index]?.focus();
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open, items, value]);

  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      focusInput();
      return;
    }
    if (!open && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      if (disabled) return;
      event.preventDefault();
      setOpen(true);
      return;
    }
    if (open && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const buttons = [
        ...(popup.current?.querySelectorAll<HTMLButtonElement>('[data-lookup-option]') ?? []),
      ];
      const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const index =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? buttons.length - 1
            : (current + (event.key === 'ArrowUp' ? -1 : 1) + buttons.length) % buttons.length;
      buttons[index]?.focus();
    }
  }

  const columns: Column<T>[] = [
    { key: 'no', title: 'No', width: 32, align: 'center', render: (_item, index) => index + 1 },
    {
      key: 'description',
      title: 'Description',
      align: 'left',
      render: (item) => (
        <button
          type="button"
          className="lookup-dropdown-option"
          data-lookup-option
          aria-current={item.code === value ? 'true' : undefined}
        >
          {item.name}
        </button>
      ),
    },
  ];

  return (
    <div
      ref={root}
      className="ui-lookup-dropdown"
      style={appearance({ width, height, color, backgroundColor, style })}
      onKeyDown={handleKeys}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <Input
        id={id}
        role="combobox"
        aria-label={id ? undefined : label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popupId : undefined}
        aria-readonly="true"
        value={selected?.name ?? ''}
        readOnly
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen(!open);
        }}
        height="100%"
        color={color}
        backgroundColor={backgroundColor}
      />
      <Button
        className="lookup-dropdown-trigger"
        variant="ghost"
        tone="neutral"
        disabled={disabled}
        aria-label={`เลือก${label}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popupId : undefined}
        title={`เลือก${label}`}
        onClick={() => setOpen(!open)}
      >
        <Icon name={icon} size={16} color={color ?? 'var(--lookup-icon-color, #242424)'} />
      </Button>
      {open && (
        <div
          ref={popup}
          role="dialog"
          aria-label={`เลือก${label}`}
          id={popupId}
          className="lookup-dropdown-popup"
          style={{ width: popupWidth }}
        >
          <Table
            className="lookup-dropdown-table"
            columns={columns}
            rows={[...items]}
            rowKey={(item) => item.code}
            label={`รายการ${label}`}
            onRowClick={select}
          />
        </div>
      )}
    </div>
  );
}
