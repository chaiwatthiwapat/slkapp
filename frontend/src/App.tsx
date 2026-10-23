import { useEffect, useState } from 'react';
import { Button, Icon, Input, Modal } from './components/ui';
import { Navbar } from './features/workspace/Navbar';
import { salesMenu, type MenuItem } from './features/workspace/menu';
import { createDocument, type SalesDocument } from './features/sales/model';
import { readDocuments } from './features/sales/storage';
import { SalesPage } from './features/sales/SalesPage';

interface Tab {
  id: string;
  menu: MenuItem;
  document?: SalesDocument;
  dirty: boolean;
}
const firstId = 'workspace-initial';
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
        <p className="muted">เริ่มใช้งานหน้าขายบริการเงินสดได้จากเมนู 2.13</p>
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
      menu: salesMenu,
      document: readDocuments()[0] ?? createDocument(),
      dirty: false,
    },
  ]);
  const [activeId, setActiveId] = useState<string | null>(firstId);
  const [closing, setClosing] = useState<Tab | null>(null);
  const [help, setHelp] = useState(false);
  const [api, setApi] = useState<'checking' | 'online' | 'offline'>('checking');
  const active = tabs.find((tab) => tab.id === activeId);
  useEffect(() => {
    const showHelp = () => setHelp(true);
    window.addEventListener('slkapp:help', showHelp);
    const controller = new AbortController();
    void fetch('/api/health', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setApi(data.status === 'ok' ? 'online' : 'offline'))
      .catch(() => {
        if (!controller.signal.aborted) setApi('offline');
      });
    return () => {
      window.removeEventListener('slkapp:help', showHelp);
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
  function openMenu(menu: MenuItem, fresh = false) {
    const existing = tabs.find((tab) => tab.menu.id === menu.id);
    if (existing && !fresh) {
      setActiveId(existing.id);
      return;
    }
    const id = crypto.randomUUID();
    setTabs((current) => [
      ...current,
      {
        id,
        menu,
        dirty: false,
        document:
          menu.kind === 'sales'
            ? fresh
              ? createDocument()
              : (readDocuments()[0] ?? createDocument())
            : undefined,
      },
    ]);
    setActiveId(id);
  }
  function removeTab(id: string) {
    const index = tabs.findIndex((tab) => tab.id === id);
    const remaining = tabs.filter((tab) => tab.id !== id);
    setTabs(remaining);
    if (activeId === id) setActiveId(remaining[Math.max(0, index - 1)]?.id ?? null);
    setClosing(null);
  }
  function requestClose(tab: Tab) {
    if (tab.dirty) setClosing(tab);
    else removeTab(tab.id);
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
      <div
        className="editor-tabs"
        role="tablist"
        aria-label="หน้าที่เปิดอยู่"
        onKeyDown={(event) => {
          if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
          const index = tabs.findIndex((tab) => tab.id === activeId);
          const next =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? tabs.length - 1
                : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          const tab = tabs[next];
          if (tab) {
            event.preventDefault();
            setActiveId(tab.id);
            document.getElementById(`tab-${tab.id}`)?.focus();
          }
        }}
      >
        {tabs.map((tab, index) => (
          <div key={tab.id} className={`editor-tab ${activeId === tab.id ? 'active' : ''}`}>
            <button
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeId === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={activeId === tab.id ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
            >
              <Icon name={tab.menu.kind === 'sales' ? 'file' : 'grid'} size={14} />
              <span>
                {tab.menu.id} {tab.menu.title}
                {index > 0 && tab.menu.kind === 'sales' ? ` (${index + 1})` : ''}
              </span>
              {tab.dirty && (
                <span className="dirty-dot" title="ยังไม่ได้บันทึก" aria-hidden="true" />
              )}
            </button>
            <button
              className="tab-close"
              aria-label={`ปิดแท็บ ${index + 1}`}
              onClick={() => requestClose(tab)}
            >
              <Icon name="close" size={12} />
            </button>
          </div>
        ))}
        <Button
          className="tab-add"
          variant="ghost"
          tone="neutral"
          aria-label="เปิดเอกสารใหม่"
          title="เปิดเอกสารขายบริการใหม่"
          onClick={() => openMenu(salesMenu, true)}
        >
          <Icon name="plus" />
        </Button>
        <span className="tab-count">{tabs.length} หน้าที่เปิดอยู่</span>
      </div>
      <main className="workspace-main">
        {tabs.length === 0 && (
          <div className="empty-workspace">
            <Icon name="grid" size={40} />
            <h1>พื้นที่ทำงานของคุณ</h1>
            <p>เลือกเมนูด้านบนเพื่อเริ่มทำงาน</p>
            <Button variant="solid" onClick={() => openMenu(salesMenu)}>
              เปิดขายบริการเงินสด
              <Icon name="arrow" />
            </Button>
          </div>
        )}
        {tabs.map((tab) => (
          <section
            key={tab.id}
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            role="tabpanel"
            hidden={activeId !== tab.id}
            className="workspace-panel"
          >
            {tab.menu.kind === 'sales' ? (
              <SalesPage
                tabId={tab.id}
                initialDocument={tab.document!}
                active={activeId === tab.id}
                onDirtyChange={(dirty) => setDirty(tab.id, dirty)}
                onNew={() => openMenu(salesMenu, true)}
                onClose={(discard) => (discard ? removeTab(tab.id) : requestClose(tab))}
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
        onClose={() => setClosing(null)}
        width={430}
        footer={
          <>
            <Button tone="neutral" onClick={() => setClosing(null)}>
              กลับไปทำงาน
            </Button>
            <Button tone="danger" variant="solid" onClick={() => closing && removeTab(closing.id)}>
              ปิดและทิ้งการแก้ไข
            </Button>
          </>
        }
      >
        <p>มีการแก้ไขในแท็บนี้ที่ยังไม่ได้บันทึก กรุณาบันทึกก่อนปิดหากต้องการเก็บข้อมูล</p>
      </Modal>
      <Modal
        open={help}
        title="ยินดีต้อนรับสู่ SLK Workspace"
        onClose={() => setHelp(false)}
        width={540}
      >
        <p>
          เลือกเมนูระบบงานเพื่อเปิดแท็บ แต่ละแท็บเก็บข้อมูลแยกกัน กด New หรือเครื่องหมาย +
          เพื่อเปิดเอกสารขายบริการอีกชุด
        </p>
        <p>
          เมนู 2.13 เป็นหน้าต้นแบบที่แก้ไขรายการ คำนวณยอด เลือกข้อมูล และบันทึกใน browser ได้
          เมนูอื่นเตรียมพื้นที่สำหรับพัฒนาต่อ
        </p>
        <p className="muted">ข้อมูลยังไม่ถูกบันทึกลง backend และอาจหายได้เมื่อล้างข้อมูล browser</p>
      </Modal>
    </div>
  );
}
