import { Field, Icon, Input, LookupDropdown, Select } from '../../components/ui';
import { saleTypes, type SaleAndServiceDocument } from './model';
import { LookupField } from './FormControls';

export type UpdateDocument = <K extends keyof SaleAndServiceDocument>(
  key: K,
  value: SaleAndServiceDocument[K],
) => void;
interface Props {
  document: SaleAndServiceDocument;
  update: UpdateDocument;
  onCustomerLookup: () => void;
  onDocumentLookup: () => void;
}
export function TopForm({ document, update, onCustomerLookup, onDocumentLookup }: Props) {
  return (
    <section className="form-top" aria-label="ข้อมูลเอกสาร">
      <div className="form-top-column">
        <Field label="ประเภทการขาย">
          {(id) => (
            <LookupDropdown
              id={id}
              label="ประเภทการขาย"
              height={29}
              value={saleTypes.find((item) => item.name === document.type)?.code ?? ''}
              items={saleTypes}
              onSelect={(item) => update('type', item.name)}
            />
          )}
        </Field>
        <Field label="เลขที่เอกสาร" required>
          {(id) => (
            <LookupField
              id={id}
              className="document-number mono"
              value={document.number}
              onChange={(event) => update('number', event.target.value)}
              onLookup={onDocumentLookup}
              lookupLabel="ค้นหาเอกสารที่บันทึก"
            />
          )}
        </Field>
        <Field label="เลขที่ใบกำกับภาษี">
          {(id) => (
            <Input
              id={id}
              value={document.taxNumber}
              placeholder="ระบุเลขที่ใบกำกับภาษี"
              onChange={(event) => update('taxNumber', event.target.value)}
            />
          )}
        </Field>
      </div>
      <div className="form-top-column">
        <Field label="ประเภทภาษี">
          {(id) => (
            <Select
              id={id}
              value={document.taxType}
              onChange={(event) =>
                update('taxType', event.target.value as SaleAndServiceDocument['taxType'])
              }
            >
              <option value="exclusive">ภาษีแยกนอก</option>
              <option value="inclusive">ภาษีรวมใน</option>
              <option value="exempt">ยกเว้นภาษี</option>
            </Select>
          )}
        </Field>
        <Field label="วันที่ออกเอกสาร" required>
          {(id) => (
            <Input
              id={id}
              type="date"
              value={document.date}
              onChange={(event) => update('date', event.target.value)}
            />
          )}
        </Field>
        <Field label="วันที่ใบกำกับภาษี">
          {(id) => (
            <Input
              id={id}
              type="date"
              value={document.taxDate}
              onChange={(event) => update('taxDate', event.target.value)}
            />
          )}
        </Field>
      </div>
      <div className="customer-row">
        <Field label="รหัสลูกค้า" required>
          {(id) => (
            <LookupField
              id={id}
              className="mono"
              value={document.customerCode}
              onChange={(event) => update('customerCode', event.target.value)}
              onLookup={onCustomerLookup}
              lookupLabel="ค้นหาลูกค้า"
            />
          )}
        </Field>
        <Input
          aria-label="ชื่อลูกค้า"
          value={document.customerName}
          onChange={(event) => update('customerName', event.target.value)}
          placeholder="ชื่อลูกค้า / บริษัท"
        />
        <span className="customer-tag">
          <Icon name="bank" size={13} />
          สำนักงานใหญ่
        </span>
      </div>
    </section>
  );
}
