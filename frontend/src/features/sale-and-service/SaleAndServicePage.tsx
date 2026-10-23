import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Icon,
  Lookup,
  Modal,
  Table,
  type Column,
  type LookupItem,
} from '../../components/ui';
import {
  blankLine,
  calculateTotals,
  createDocument,
  customers,
  isActiveLine,
  money,
  products,
  validateDocument,
  type Product,
  type SaleAndServiceDocument,
  type SaleAndServiceLine,
} from './model';
import { deleteDocument, readDocuments, saveDocument } from './storage';
import { TopForm, type UpdateDocument } from './TopForm';
import { LinesTable } from './LinesTable';
import { BottomForm, type MasterLookup } from './BottomForm';
import { saleAndServiceMenu } from '../workspace/menu';

interface Props {
  tabId: string;
  initialDocument: SaleAndServiceDocument;
  active: boolean;
  onDirtyChange: (dirty: boolean) => void;
  onClose: (discard?: boolean) => void;
}
type Preview = 'ACC' | 'TAX' | 'Detail' | 'FIN';
const masterData: Record<MasterLookup, { title: string; items: LookupItem[] }> = {
  deliveryTerm: {
    title: 'เงื่อนไขการส่งมอบ',
    items: [
      { code: 'DEL01', name: 'จัดส่งถึงสำนักงานลูกค้า' },
      { code: 'DEL02', name: 'ลูกค้ารับเอง' },
    ],
  },
  bookCode: {
    title: 'รหัสสมุดเงิน',
    items: [
      { code: 'CASH01', name: 'เงินสดรับ' },
      { code: 'BANK01', name: 'เงินฝากธนาคาร' },
    ],
  },
  department: {
    title: 'รหัสแผนก',
    items: [
      { code: 'SALES', name: 'ฝ่ายขาย' },
      { code: 'SERVICE', name: 'ฝ่ายบริการ' },
    ],
  },
  contact: {
    title: 'รหัสผู้ติดต่อ',
    items: [
      { code: 'CT001', name: 'ฝ่ายจัดซื้อ' },
      { code: 'CT002', name: 'ฝ่ายบัญชี' },
    ],
  },
  salesperson: {
    title: 'รหัสพนักงานขาย',
    items: [
      { code: 'SL001', name: 'พนักงานขาย 01' },
      { code: 'SL002', name: 'พนักงานขาย 02' },
    ],
  },
};
export function SaleAndServicePage({
  tabId,
  initialDocument,
  active,
  onDirtyChange,
  onClose,
}: Props) {
  const [document, setDocument] = useState(initialDocument);
  const [baseline, setBaseline] = useState(JSON.stringify(initialDocument));
  const [saved, setSaved] = useState(readDocuments);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [customerLookup, setCustomerLookup] = useState(false);
  const [productRow, setProductRow] = useState<string | null>(null);
  const [master, setMaster] = useState<MasterLookup | null>(null);
  const [documentLookup, setDocumentLookup] = useState(false);
  const [pendingDocument, setPendingDocument] = useState<SaleAndServiceDocument | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [deleting, setDeleting] = useState(false);
  const dirty = JSON.stringify(document) !== baseline;
  const dirtyCallback = useRef(onDirtyChange);
  dirtyCallback.current = onDirtyChange;
  useEffect(() => {
    dirtyCallback.current(dirty);
  }, [dirty]);
  const totals = calculateTotals(document);
  const currentIndex = saved.findIndex((item) => item.id === document.id);
  const update: UpdateDocument = (key, value) => {
    setDocument((current) => ({ ...current, [key]: value }));
    setNotice(null);
  };
  useEffect(() => {
    const sync = () => setSaved(readDocuments());
    window.addEventListener('storage', sync);
    window.addEventListener('slkapp:saved', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('slkapp:saved', sync);
    };
  }, []);
  function save() {
    const error = validateDocument(document);
    if (error) {
      setNotice({ text: error, error: true });
      return;
    }
    try {
      saveDocument(document);
      setBaseline(JSON.stringify(document));
      window.dispatchEvent(new Event('slkapp:saved'));
      setNotice({ text: 'บันทึกเอกสารใน browser แล้ว' });
    } catch (error) {
      setNotice({
        text:
          error instanceof Error
            ? error.message
            : 'บันทึกไม่สำเร็จ กรุณาตรวจสอบพื้นที่จัดเก็บใน browser',
        error: true,
      });
    }
  }
  useEffect(() => {
    if (!active) return;
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        // Native dialogs own their keyboard interactions while open.
        if (!window.document.querySelector('dialog[open]')) save();
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  });
  function updateLine(id: string, key: keyof SaleAndServiceLine, value: string | number) {
    update(
      'lines',
      document.lines.map((line) => (line.id === id ? { ...line, [key]: value } : line)),
    );
  }
  function selectProduct(product: Product) {
    update(
      'lines',
      document.lines.map((line) =>
        line.id === productRow
          ? {
              ...line,
              code: product.code,
              name: product.name,
              unit: product.unit,
              price: product.price,
              quantity: line.quantity || 1,
            }
          : line,
      ),
    );
  }
  function load(next: SaleAndServiceDocument) {
    if (dirty) {
      setPendingDocument(next);
      return;
    }
    applyDocument(next);
  }
  function applyDocument(next: SaleAndServiceDocument) {
    setDocument(next);
    setBaseline(JSON.stringify(next));
    setPendingDocument(null);
    setNotice(null);
  }
  function remove() {
    try {
      deleteDocument(document.id);
      window.dispatchEvent(new Event('slkapp:saved'));
      setDeleting(false);
      onClose(true);
    } catch {
      setNotice({ text: 'ลบไม่สำเร็จ กรุณาตรวจสอบพื้นที่จัดเก็บใน browser', error: true });
      setDeleting(false);
    }
  }
  const documentItems = saved.map((item) => ({
    code: item.number,
    name: item.customerName || 'ยังไม่ระบุลูกค้า',
    detail: item.date,
    document: item,
  }));
  return (
    <article className="sale-and-service-page" data-page={saleAndServiceMenu.nameEn}>
      <div className="page-heading">
        <div>
          <div className="breadcrumb">
            ระบบขายและลูกหนี้
            <Icon name="right" size={11} />
            <span>2.13</span>
          </div>
          <div className="page-title">
            <span className="title-icon">
              <Icon name="file" size={20} />
            </span>
            <h1>{saleAndServiceMenu.title}</h1>
            <span className={`document-state ${dirty ? 'is-dirty' : ''}`}>
              <span />
              {dirty ? 'ยังไม่ได้บันทึก' : 'ไม่มีการแก้ไข'}
            </span>
          </div>
        </div>
        <div className="heading-meta">
          <span className="document-reference mono">{document.number}</span>
          <span>ขายสินค้า, บริการ / Sale and service</span>
        </div>
      </div>
      <div className="button-action" aria-label="คำสั่งเอกสาร">
        <div className="action-primary">
          <Button tone="neutral" onClick={() => onClose()}>
            <Icon name="left" />
            Back
          </Button>
          <Button onClick={() => load(createDocument())}>
            <Icon name="plus" />
            New
          </Button>
          <Button variant="solid" onClick={save} title="บันทึกใน browser (Ctrl+S / ⌘S)">
            <Icon name="save" />
            Save
          </Button>
          <span className="action-divider" />
          <Button
            tone="neutral"
            variant="ghost"
            disabled={currentIndex <= 0}
            title="เอกสารก่อนหน้า"
            onClick={() => load(saved[currentIndex - 1])}
          >
            <Icon name="left" size={13} />
            Prev
          </Button>
          <Button
            tone="neutral"
            variant="ghost"
            disabled={currentIndex < 0 || currentIndex >= saved.length - 1}
            title="เอกสารถัดไป"
            onClick={() => load(saved[currentIndex + 1])}
          >
            Next
            <Icon name="right" size={13} />
          </Button>
        </div>
        <div className="action-secondary">
          {(['ACC', 'TAX', 'Detail'] as const).map((name) => (
            <Button key={name} tone="secondary" variant="ghost" onClick={() => setPreview(name)}>
              {name}
            </Button>
          ))}
          <Button tone="secondary" variant="ghost" disabled title="เตรียมพัฒนาภาษีหัก ณ ที่จ่าย">
            WHT
          </Button>
          <Button tone="secondary" variant="ghost" onClick={() => setPreview('FIN')}>
            FIN
          </Button>
          <span className="action-divider" />
          <Button tone="success" variant="soft" onClick={() => window.print()}>
            <Icon name="print" />
            Print
          </Button>
          <Button tone="danger" variant="ghost" onClick={() => setDeleting(true)}>
            <Icon name="trash" />
            Delete
          </Button>
        </div>
      </div>
      {notice && (
        <div
          role={notice.error ? 'alert' : 'status'}
          aria-label={notice.error ? 'ตรวจสอบเอกสาร' : 'สถานะการบันทึก'}
          className={`document-notice ${notice.error ? 'error' : ''}`}
        >
          <Icon name={notice.error ? 'info' : 'check'} size={15} />
          {notice.text}
          <button aria-label="ปิดข้อความ" onClick={() => setNotice(null)}>
            <Icon name="close" size={13} />
          </button>
        </div>
      )}
      <TopForm
        document={document}
        update={update}
        onCustomerLookup={() => setCustomerLookup(true)}
        onDocumentLookup={() => {
          setSaved(readDocuments());
          setDocumentLookup(true);
        }}
      />
      <LinesTable
        lines={document.lines}
        onUpdate={updateLine}
        onProductLookup={setProductRow}
        onAdd={() => update('lines', [...document.lines, blankLine()])}
        onRemove={(id) =>
          update(
            'lines',
            document.lines.map((line) => (line.id === id ? { ...blankLine(), id } : line)),
          )
        }
      />
      <BottomForm document={document} update={update} onLookup={setMaster} />
      <Lookup
        open={customerLookup}
        title="ค้นหาลูกค้า"
        onClose={() => setCustomerLookup(false)}
        items={customers}
        onSelect={(item) => {
          setDocument((current) => ({
            ...current,
            customerCode: item.code,
            customerName: item.name,
          }));
          setNotice(null);
        }}
      />
      <Lookup
        key={productRow ?? 'closed'}
        open={Boolean(productRow)}
        title="ค้นหาสินค้าและบริการ"
        onClose={() => setProductRow(null)}
        items={products}
        onSelect={selectProduct}
      />
      {master && (
        <Lookup
          open
          title={`ค้นหา${masterData[master].title}`}
          items={masterData[master].items}
          onClose={() => setMaster(null)}
          onSelect={(item) => update(master, item.code)}
        />
      )}
      <Lookup
        open={documentLookup}
        title="ค้นหาเอกสารที่บันทึกใน browser"
        onClose={() => setDocumentLookup(false)}
        items={documentItems}
        onSelect={(item) => load(item.document)}
      />
      <Modal
        open={Boolean(pendingDocument)}
        title="เปิดเอกสารอื่น?"
        onClose={() => setPendingDocument(null)}
        width={440}
        footer={
          <>
            <Button tone="neutral" onClick={() => setPendingDocument(null)}>
              ยกเลิก
            </Button>
            <Button
              tone="danger"
              variant="solid"
              onClick={() => pendingDocument && applyDocument(pendingDocument)}
            >
              ทิ้งการแก้ไขและเปิดเอกสาร
            </Button>
          </>
        }
      >
        <p>มีข้อมูลที่ยังไม่ได้บันทึกในแท็บนี้ การเปิดเอกสารอื่นจะทิ้งการแก้ไขปัจจุบัน</p>
      </Modal>
      <Modal
        open={deleting}
        title="ลบเอกสารนี้?"
        onClose={() => setDeleting(false)}
        width={440}
        footer={
          <>
            <Button tone="neutral" onClick={() => setDeleting(false)}>
              ยกเลิก
            </Button>
            <Button tone="danger" variant="solid" onClick={remove}>
              ยืนยันลบเอกสาร
            </Button>
          </>
        }
      >
        <p>
          ลบเอกสาร <strong>{document.number}</strong> ออกจากข้อมูลใน browser และปิดแท็บนี้
        </p>
      </Modal>
      <Modal
        open={preview !== null}
        title={
          preview === 'Detail'
            ? 'รายละเอียดเพิ่มเติม'
            : preview === 'ACC'
              ? 'ตัวอย่างการลงบัญชี'
              : preview === 'TAX'
                ? 'สรุปภาษีมูลค่าเพิ่ม'
                : 'สรุปการรับชำระ'
        }
        onClose={() => setPreview(null)}
        footer={<Button onClick={() => setPreview(null)}>ปิด</Button>}
      >
        {preview === 'Detail' ? (
          <>
            <label htmlFor={`note-${tabId}`}>หมายเหตุเอกสาร</label>
            <textarea
              id={`note-${tabId}`}
              className="document-note ui-input"
              value={document.note}
              onChange={(event) => update('note', event.target.value)}
              placeholder="ระบุรายละเอียดหรือหมายเหตุเพิ่มเติม..."
            />
            <p className="muted">กด Save ที่หน้าเอกสารเพื่อบันทึกหมายเหตุ</p>
          </>
        ) : preview === 'ACC' ? (
          <AccountingPreview document={document} />
        ) : (
          <div className="preview-summary">
            <p className="muted">ข้อมูลคำนวณจากเอกสารปัจจุบัน</p>
            <p>
              <span>เลขที่เอกสาร</span>
              <strong className="mono">{document.number}</strong>
            </p>
            <p>
              <span>มูลค่าก่อนภาษี</span>
              <strong className="mono">{money(totals.taxBase)}</strong>
            </p>
            <p>
              <span>ภาษีมูลค่าเพิ่ม</span>
              <strong className="mono">{money(totals.vat)}</strong>
            </p>
            <p>
              <span>ค่าขนส่ง</span>
              <strong className="mono">{money(document.shipping)}</strong>
            </p>
            <p>
              <span>มูลค่าสุทธิ</span>
              <strong className="mono">{money(totals.total)} บาท</strong>
            </p>
            {preview === 'FIN' && (
              <p className="preview-disclaimer">
                ยังไม่มีการบันทึกรับชำระเงินจริง ระบบรับชำระจะพัฒนาในขั้นถัดไป
              </p>
            )}
          </div>
        )}
      </Modal>
    </article>
  );
}
function AccountingPreview({ document }: { document: SaleAndServiceDocument }) {
  const totals = calculateTotals(document);
  const rows = [
    { name: 'เงินสด', debit: totals.total, credit: 0 },
    { name: 'รายได้ค่าบริการ', debit: 0, credit: totals.taxBase },
    ...(totals.vat ? [{ name: 'ภาษีขาย', debit: 0, credit: totals.vat }] : []),
    ...(document.shipping ? [{ name: 'รายได้ค่าขนส่ง', debit: 0, credit: document.shipping }] : []),
  ];
  const columns: Column<(typeof rows)[number]>[] = [
    { key: 'name', title: 'บัญชี', render: (row) => row.name },
    { key: 'debit', title: 'เดบิต', width: 130, align: 'right', render: (row) => money(row.debit) },
    {
      key: 'credit',
      title: 'เครดิต',
      width: 130,
      align: 'right',
      render: (row) => money(row.credit),
    },
  ];
  return (
    <>
      <p className="preview-disclaimer">ตัวอย่าง UI เท่านั้น ยังไม่เชื่อมผังบัญชีหรือบันทึกบัญชี</p>
      <Table columns={columns} rows={rows} rowKey={(row) => row.name} label="ตัวอย่างการลงบัญชี" />
      <p className="muted" style={{ marginTop: 12 }}>
        รายการบริการ {document.lines.filter(isActiveLine).length} รายการ · ภาษีขาย{' '}
        {money(totals.vat)} บาท
      </p>
    </>
  );
}
