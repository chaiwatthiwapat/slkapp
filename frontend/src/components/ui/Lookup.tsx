import { useState } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { Input } from './Input';
import { Modal, type ModalProps } from './Modal';
import { Table, type Column } from './Table';

export interface LookupItem {
  code: string;
  name: string;
  detail?: string;
}
interface LookupProps<T extends LookupItem> extends Omit<ModalProps, 'children' | 'footer'> {
  items: T[];
  onSelect: (item: T) => void;
}
export function Lookup<T extends LookupItem>({ items, onSelect, ...modal }: LookupProps<T>) {
  const [search, setSearch] = useState('');
  const filtered = items.filter((item) =>
    `${item.code} ${item.name} ${item.detail ?? ''}`
      .toLocaleLowerCase()
      .includes(search.toLocaleLowerCase()),
  );
  const columns: Column<T>[] = [
    {
      key: 'code',
      title: 'รหัส',
      width: '26%',
      render: (item) => (
        <Button
          variant="ghost"
          onClick={() => {
            onSelect(item);
            modal.onClose();
          }}
        >
          {item.code}
        </Button>
      ),
    },
    {
      key: 'name',
      title: 'ชื่อ / รายละเอียด',
      render: (item) => (
        <>
          <strong>{item.name}</strong>
          {item.detail && <small className="lookup-detail">{item.detail}</small>}
        </>
      ),
    },
    {
      key: 'select',
      title: '',
      width: 70,
      render: (item) => (
        <Button
          variant="soft"
          aria-label={`เลือก ${item.code}`}
          onClick={() => {
            onSelect(item);
            modal.onClose();
          }}
        >
          <Icon name="check" />
        </Button>
      ),
    },
  ];
  return (
    <Modal
      {...modal}
      footer={
        <>
          <span className="muted">พบ {filtered.length} รายการ</span>
          <Button tone="neutral" onClick={modal.onClose}>
            ยกเลิก
          </Button>
        </>
      }
    >
      <div className="lookup-search">
        <Icon name="search" />
        <Input
          aria-label="ค้นหาในรายการ"
          placeholder="ค้นหาด้วยรหัส หรือชื่อ..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          autoFocus
        />
      </div>
      <Table
        columns={columns}
        rows={filtered}
        rowKey={(item) => item.code}
        label={modal.title}
        height={300}
      />
    </Modal>
  );
}
