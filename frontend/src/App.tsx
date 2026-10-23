import { useEffect, useState } from 'react';
import { Button, Icon, Input, Modal } from './components/ui';
import { Navbar } from './features/workspace/Navbar';
import { TabBar } from './features/workspace/TabBar';
import { WelcomePage } from './features/workspace/WelcomePage';
import { saleAndServiceMenu, type MenuItem } from './features/workspace/menu';
import { createDocument, type SaleAndServiceDocument } from './features/sale-and-service/model';
import { readDocuments } from './features/sale-and-service/storage';
import { SaleAndServicePage } from './features/sale-and-service/SaleAndServicePage';

interface Tab {
  id: string;
  menu: MenuItem;
  document?: SaleAndServiceDocument;
  dirty: boolean;
}
const firstId = `menu-${saleAndServiceMenu.id}`;
function PlannedPage({ menu }: { menu: MenuItem }) {
  const [note, setNote] = useState('');
  return (
    <div className="planned-page">
      <div className="planned-card">
        <span className="planned-icon">
          <Icon name="grid" size={30} />
        </span>
        <span className="eyebrow">เมนู {menu.id}</span>
        <h1>{menu.title}</h1>
        <p>พื้นที่สำหรับพัฒนาหน้านี้ในขั้นถัดไป</p>
        <p className="muted">เริ่มใช้งานหน้าขายสินค้า, บริการได้จากเมนู 2.13</p>
        <label htmlFor={`memo-${menu.id}`}>บันทึกส่วนตัวของแท็บนี้</label>
        <Input
          id={`memo-${menu.id}`}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="ลองพิมพ์ แล้วสลับไปแท็บอื่น..."
        />
        <small className="muted">บันทึกนี้เก็บไว้ระหว่างเปิดแท็บเท่านั้น</small>
      </div>
    </div>
  );
}
export function App() {
  const [tabs, setTabs] = useState<Tab[]>(() => [
    {
      id: firstId,
      menu: saleAndServiceMenu,
      document: readDocuments()[0] ?? createDocument(),
      dirty: false,
    },
  ]);
  const [activeId, setActiveId] = useState<string | null>(firstId);
  const [closing, setClosing] = useState<{ ids: string[]; fallbackId?: string } | null>(null);
  const [api, setApi] = useState<'checking' | 'online' | 'offline'>('checking');
  const active = tabs.find((tab) => tab.id === activeId);
  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/health', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setApi(data.status === 'ok' ? 'online' : 'offline'))
      .catch(() => {
        if (!controller.signal.aborted) setApi('offline');
      });
    return () => {
      controller.abort();
    };
  }, []);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (tabs.some((tab) => tab.dirty)) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [tabs]);
  function openMenu(menu: MenuItem) {
    const id = `menu-${menu.id}`;
    setTabs((current) =>
      current.some((tab) => tab.menu.id === menu.id)
        ? current
        : [
            ...current,
            {
              id,
              menu,
              dirty: false,
              document:
                menu.kind === 'sale-and-service'
                  ? (readDocuments()[0] ?? createDocument())
                  : undefined,
            },
          ],
    );
    setActiveId(id);
  }
  function removeTabs(ids: string[], fallbackId?: string) {
    const targets = new Set(ids);
    const remaining = tabs.filter((tab) => !targets.has(tab.id));
    const activeIndex = tabs.findIndex((tab) => tab.id === activeId);
    const next =
      remaining.find((tab) => tab.id === activeId) ??
      remaining.find((tab) => tab.id === fallbackId) ??
      tabs
        .slice(0, activeIndex)
        .reverse()
        .find((tab) => !targets.has(tab.id)) ??
      remaining[0];
    setTabs(remaining);
    setActiveId(next?.id ?? null);
    setClosing(null);
    if (next) requestAnimationFrame(() => document.getElementById(`tab-${next.id}`)?.focus());
  }
  function requestClose(ids: string[], fallbackId?: string) {
    const targets = tabs.filter((tab) => ids.includes(tab.id));
    if (!targets.length) return;
    if (targets.some((tab) => tab.dirty))
      setClosing({ ids: targets.map((tab) => tab.id), fallbackId });
    else removeTabs(ids, fallbackId);
  }
  function cancelClose() {
    const focusId = closing?.fallbackId ?? activeId;
    setClosing(null);
    if (focusId) requestAnimationFrame(() => document.getElementById(`tab-${focusId}`)?.focus());
  }
  function setDirty(id: string, dirty: boolean) {
    setTabs((current) =>
      current.some((tab) => tab.id === id && tab.dirty !== dirty)
        ? current.map((tab) => (tab.id === id ? { ...tab, dirty } : tab))
        : current,
    );
  }
  return (
    <div className="app-shell">
      <Navbar activeMenu={active?.menu.id} onOpen={openMenu} />
      {tabs.length > 0 && (
        <TabBar
          tabs={tabs.map((tab) => ({
            id: tab.id,
            title: `${tab.menu.id} ${tab.menu.title}`,
            icon: tab.menu.kind === 'sale-and-service' ? 'file' : 'grid',
            dirty: tab.dirty,
          }))}
          activeId={activeId}
          onSelect={setActiveId}
          onCloseTabs={requestClose}
        />
      )}
      <main className={`workspace-main${tabs.length ? '' : ' is-empty'}`}>
        {tabs.length === 0 && <WelcomePage />}
        {tabs.map((tab) => (
          <section
            key={tab.id}
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            role="tabpanel"
            hidden={activeId !== tab.id}
            className="workspace-panel"
          >
            {tab.menu.kind === 'sale-and-service' ? (
              <SaleAndServicePage
                tabId={tab.id}
                initialDocument={tab.document!}
                active={activeId === tab.id}
                onDirtyChange={(dirty) => setDirty(tab.id, dirty)}
                onClose={(discard) => (discard ? removeTabs([tab.id]) : requestClose([tab.id]))}
              />
            ) : (
              <PlannedPage menu={tab.menu} />
            )}
          </section>
        ))}
      </main>
      <footer className="workspace-status">
        <span>
          <span className={`status-dot ${api}`} />
          {api === 'online'
            ? 'API พร้อมเชื่อมต่อ'
            : api === 'checking'
              ? 'กำลังเชื่อมต่อ API'
              : 'API ไม่พร้อมเชื่อมต่อ'}
        </span>
        <span className="storage-status">
          <Icon name="save" size={12} />
          ข้อมูลสาธิต · บันทึกใน browser
        </span>
        <span className="status-right">
          SLK Workspace <span className="muted">v0.1.0</span>
        </span>
      </footer>
      <Modal
        open={Boolean(closing)}
        title="ปิดแท็บที่ยังไม่ได้บันทึก?"
        onClose={cancelClose}
        width={430}
        footer={
          <>
            <Button tone="neutral" onClick={cancelClose}>
              กลับไปทำงาน
            </Button>
            <Button
              tone="danger"
              variant="solid"
              onClick={() => closing && removeTabs(closing.ids, closing.fallbackId)}
            >
              ปิดและทิ้งการแก้ไข
            </Button>
          </>
        }
      >
        <p>มีข้อมูลที่ยังไม่ได้บันทึกในแท็บที่จะปิด กรุณาบันทึกก่อนปิดหากต้องการเก็บข้อมูล</p>
        {closing && (
          <>
            <p>คำสั่งนี้จะปิด {closing.ids.length} แท็บ โดยมีข้อมูลที่ยังไม่ได้บันทึกใน:</p>
            <ul className="closing-tabs">
              {tabs
                .filter((tab) => closing.ids.includes(tab.id) && tab.dirty)
                .map((tab) => (
                  <li key={tab.id}>
                    {tab.menu.id} {tab.menu.title}
                  </li>
                ))}
            </ul>
          </>
        )}
      </Modal>
    </div>
  );
}
