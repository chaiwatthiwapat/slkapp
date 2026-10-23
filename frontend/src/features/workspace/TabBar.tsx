import { useState } from 'react';
import { ContextMenu, Icon, type ContextMenuItem, type IconName } from '../../components/ui';

export interface TabBarItem {
  id: string;
  title: string;
  icon: IconName;
  dirty: boolean;
}
interface Props {
  tabs: readonly TabBarItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCloseTabs: (ids: string[], fallbackId?: string) => void;
}
interface TabMenu {
  tabId: string;
  x: number;
  y: number;
  trigger: HTMLButtonElement;
}
export function TabBar({ tabs, activeId, onSelect, onCloseTabs }: Props) {
  const [context, setContext] = useState<TabMenu | null>(null);
  const contextIndex = tabs.findIndex((tab) => tab.id === context?.tabId);
  const contextTab = tabs[contextIndex];
  const items: ContextMenuItem[] = contextTab
    ? [
        {
          id: 'close',
          label: 'Close',
          onSelect: () => onCloseTabs([contextTab.id], contextTab.id),
        },
        {
          id: 'close-left',
          label: 'Close to Left',
          disabled: contextIndex === 0,
          onSelect: () =>
            onCloseTabs(
              tabs.slice(0, contextIndex).map((tab) => tab.id),
              contextTab.id,
            ),
        },
        {
          id: 'close-right',
          label: 'Close to Right',
          disabled: contextIndex === tabs.length - 1,
          onSelect: () =>
            onCloseTabs(
              tabs.slice(contextIndex + 1).map((tab) => tab.id),
              contextTab.id,
            ),
        },
        {
          id: 'close-all',
          label: 'Close All',
          onSelect: () =>
            onCloseTabs(
              tabs.map((tab) => tab.id),
              contextTab.id,
            ),
        },
      ]
    : [];

  if (!tabs.length) return null;
  return (
    <>
      <div
        className="editor-tabs"
        role="tablist"
        aria-label="หน้าที่เปิดอยู่"
        onKeyDown={(event) => {
          if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
          const focused =
            (event.target as HTMLElement).closest<HTMLButtonElement>('[role="tab"]')?.dataset
              .tabId ?? activeId;
          const index = tabs.findIndex((tab) => tab.id === focused);
          const next =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? tabs.length - 1
                : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          const tab = tabs[next];
          if (tab) {
            event.preventDefault();
            onSelect(tab.id);
            document.getElementById(`tab-${tab.id}`)?.focus();
          }
        }}
      >
        {tabs.map((tab) => (
          <div key={tab.id} className={`editor-tab ${activeId === tab.id ? 'active' : ''}`}>
            <button
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              data-tab-id={tab.id}
              aria-selected={activeId === tab.id}
              aria-controls={`panel-${tab.id}`}
              aria-haspopup="menu"
              aria-expanded={context?.tabId === tab.id && Boolean(contextTab)}
              tabIndex={activeId === tab.id ? 0 : -1}
              onClick={() => onSelect(tab.id)}
              onContextMenu={(event) => {
                event.preventDefault();
                const bounds = event.currentTarget.getBoundingClientRect();
                setContext({
                  tabId: tab.id,
                  x: event.clientX || bounds.left,
                  y: event.clientY || bounds.bottom,
                  trigger: event.currentTarget,
                });
              }}
              onKeyDown={(event) => {
                if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
                  event.preventDefault();
                  event.stopPropagation();
                  const bounds = event.currentTarget.getBoundingClientRect();
                  setContext({
                    tabId: tab.id,
                    x: bounds.left,
                    y: bounds.bottom,
                    trigger: event.currentTarget,
                  });
                }
              }}
            >
              <Icon name={tab.icon} size={14} />
              <span>{tab.title}</span>
              {tab.dirty && (
                <span className="dirty-dot" title="ยังไม่ได้บันทึก" aria-hidden="true" />
              )}
            </button>
          </div>
        ))}
        <span className="tab-count">{tabs.length} หน้าที่เปิดอยู่</span>
      </div>
      {context && contextTab && (
        <ContextMenu
          x={context.x}
          y={context.y}
          label={`จัดการแท็บ ${contextTab.title}`}
          items={items}
          onClose={() => setContext(null)}
          returnFocus={context.trigger}
        />
      )}
    </>
  );
}
