import { useEffect, useRef, useState } from 'react';
import { Button, Icon } from '../../components/ui';
import { menuGroups, type MenuItem } from './menu';

interface Props {
  onOpen: (item: MenuItem) => void;
  activeMenu?: string;
}
export function Navbar({ onOpen, activeMenu }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!nav.current?.contains(event.target as Node)) setOpen(null);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  return (
    <header className="app-header">
      <a
        className="brand"
        href="#"
        aria-label="SLK Workspace"
        onClick={(event) => event.preventDefault()}
      >
        <span className="brand-mark">
          s<span>lk</span>
        </span>
        <span className="brand-text">
          SLK<span>WORKSPACE</span>
        </span>
      </a>
      <span className="header-divider" />
      <nav
        ref={nav}
        aria-label="ระบบงานหลัก"
        className="main-navbar"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(null);
            nav.current?.querySelector<HTMLButtonElement>(`#nav-${open}`)?.focus();
          }
          if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) && open) {
            const buttons = [
              ...(nav.current?.querySelectorAll<HTMLButtonElement>('.nav-dropdown button') ?? []),
            ];
            const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? buttons.length - 1
                  : (index + (event.key === 'ArrowUp' ? -1 : 1) + buttons.length) % buttons.length;
            event.preventDefault();
            buttons[next]?.focus();
          }
        }}
      >
        {menuGroups.map((group) => (
          <div className="nav-group" key={group.id}>
            <button
              id={`nav-${group.id}`}
              className={`nav-trigger ${activeMenu?.startsWith(`${group.id}.`) ? 'active' : ''} ${open === group.id ? 'expanded' : ''}`}
              aria-expanded={open === group.id}
              aria-controls={`menu-${group.id}`}
              onClick={() => setOpen(open === group.id ? null : group.id)}
            >
              <span className="nav-number">{group.id}</span>
              <span>{group.title}</span>
              <Icon name="down" size={12} />
            </button>
            {open === group.id && (
              <div className="nav-dropdown" id={`menu-${group.id}`}>
                <div className="dropdown-caption">
                  <Icon name={group.icon} />
                  {group.title}
                </div>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    className={activeMenu === item.id ? 'selected' : ''}
                    onClick={() => {
                      onOpen(item);
                      setOpen(null);
                      document.getElementById(`nav-${group.id}`)?.focus();
                    }}
                  >
                    <span className="menu-code mono">{item.id}</span>
                    <span>{item.title}</span>
                    {item.kind === 'sales' && <span className="menu-ready">พร้อมใช้งาน</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="header-profile">
        <span className="environment-badge">UI PREVIEW</span>
        <Button
          tone="neutral"
          variant="ghost"
          title="คู่มือเริ่มต้น"
          aria-label="ข้อมูล workspace"
          onClick={() => window.dispatchEvent(new Event('slkapp:help'))}
        >
          <Icon name="help" size={18} />
        </Button>
        <span className="avatar" title="บัญชีสาธิต">
          CW
        </span>
      </div>
    </header>
  );
}
