import { Button, Icon, Input, Table, type Column } from '../../components/ui';
import { isActiveLine, lineTotal, money, type SalesLine } from './model';

interface Props {
  lines: SalesLine[];
  onUpdate: (id: string, key: keyof SalesLine, value: string | number) => void;
  onProductLookup: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}
export function LinesTable({ lines, onUpdate, onProductLookup, onAdd, onRemove }: Props) {
  const text =
    (key: 'name' | 'warehouse' | 'location' | 'unit', label: string) =>
    (row: SalesLine, index: number) => (
      <Input
        className="cell-input"
        aria-label={`${label} แถว ${index + 1}`}
        value={row[key]}
        onChange={(event) => onUpdate(row.id, key, event.target.value)}
      />
    );
  const number =
    (key: 'quantity' | 'price' | 'discount', label: string) => (row: SalesLine, index: number) => (
      <Input
        type="number"
        min="0"
        step="0.01"
        className="cell-input number-input mono"
        aria-label={`${label} แถว ${index + 1}`}
        value={isActiveLine(row) ? row[key] : ''}
        onChange={(event) => onUpdate(row.id, key, Number(event.target.value))}
      />
    );
  const columns: Column<SalesLine>[] = [
    {
      key: 'no',
      title: 'No.',
      width: 44,
      align: 'center',
      render: (_row, index) => (
        <span className="row-number mono">{String(index + 1).padStart(2, '0')}</span>
      ),
    },
    {
      key: 'code',
      title: 'รหัสสินค้า',
      width: 140,
      render: (row, index) => (
        <div className="product-cell">
          <Input
            className="cell-input mono"
            aria-label={`รหัสสินค้า แถว ${index + 1}`}
            value={row.code}
            onChange={(event) => onUpdate(row.id, 'code', event.target.value)}
          />
          <button
            aria-label={`ค้นหาสินค้า แถว ${index + 1}`}
            title="ค้นหาสินค้า"
            onClick={() => onProductLookup(row.id)}
          >
            <Icon name="search" size={13} />
          </button>
        </div>
      ),
    },
    {
      key: 'name',
      title: 'ชื่อสินค้า / รายละเอียด',
      width: 250,
      render: text('name', 'ชื่อสินค้า'),
    },
    { key: 'warehouse', title: 'คลังสินค้า', width: 100, render: text('warehouse', 'คลังสินค้า') },
    { key: 'location', title: 'ที่เก็บ', width: 88, render: text('location', 'ที่เก็บ') },
    { key: 'unit', title: 'หน่วยนับ', width: 90, render: text('unit', 'หน่วยนับ') },
    {
      key: 'quantity',
      title: 'จำนวน',
      width: 100,
      align: 'right',
      render: number('quantity', 'จำนวน'),
    },
    {
      key: 'price',
      title: 'ราคา / หน่วย',
      width: 130,
      align: 'right',
      render: number('price', 'ราคา'),
    },
    {
      key: 'discount',
      title: 'ส่วนลด (บาท)',
      width: 115,
      align: 'right',
      render: number('discount', 'ส่วนลดรายการ'),
    },
    {
      key: 'total',
      title: 'จำนวนเงิน',
      width: 135,
      align: 'right',
      render: (row) => (
        <span className="line-amount mono">{isActiveLine(row) ? money(lineTotal(row)) : ''}</span>
      ),
    },
    {
      key: 'remove',
      title: '',
      width: 40,
      align: 'center',
      render: (row, index) => (
        <button
          className="remove-line"
          aria-label={`ลบรายการ แถว ${index + 1}`}
          onClick={() => onRemove(row.id)}
          disabled={!isActiveLine(row)}
        >
          <Icon name="trash" size={13} />
        </button>
      ),
    },
  ];
  return (
    <section className="form-table" aria-label="ส่วนรายการสินค้า">
      <header className="table-toolbar">
        <h2>
          <Icon name="box" size={15} />
          รายการสินค้าและบริการ
          <span className="count-badge">{lines.filter(isActiveLine).length} รายการ</span>
        </h2>
        <div>
          <span className="table-hint">คลิกช่องเพื่อแก้ไขข้อมูล</span>
          <Button variant="ghost" height={28} onClick={onAdd}>
            <Icon name="plus" size={14} />
            เพิ่มรายการ
          </Button>
        </div>
      </header>
      <Table
        className="invoice-table"
        label="รายการสินค้าและบริการ"
        columns={columns}
        rows={lines}
        rowKey={(line) => line.id}
        minWidth={1332}
      />
      <footer className="table-footer">
        <span>
          จำนวนรายการ <strong className="mono">{lines.filter(isActiveLine).length}</strong>
        </span>
        <span>
          จำนวนรวม{' '}
          <strong className="mono">
            {money(lines.reduce((sum, line) => sum + line.quantity, 0))}
          </strong>
        </span>
        <span className="table-footer-note">สกุลเงิน THB</span>
      </footer>
    </section>
  );
}
