import { Field, Icon, Input } from '../../components/ui';
import { calculateTotals, money, type SalesDocument } from './model';
import { LookupField } from './FormControls';
import type { UpdateDocument } from './TopForm';

export type MasterLookup = 'deliveryTerm' | 'bookCode' | 'department' | 'contact' | 'salesperson';
interface Props {
  document: SalesDocument;
  update: UpdateDocument;
  onLookup: (field: MasterLookup) => void;
}
export function BottomForm({ document, update, onLookup }: Props) {
  const totals = calculateTotals(document);
  const text = (key: MasterLookup, label: string) => (
    <Field label={label}>
      {(id) => (
        <LookupField
          id={id}
          value={document[key]}
          onChange={(event) => update(key, event.target.value)}
          onLookup={() => onLookup(key)}
          lookupLabel={`ค้นหา${label}`}
        />
      )}
    </Field>
  );
  const numeric = (
    key: 'deliveryWithin' | 'creditDays' | 'exchangeRate' | 'vatRate' | 'shipping',
    label: string,
    step = '1',
  ) => (
    <Field label={label}>
      {(id) => (
        <Input
          id={id}
          className="number-input mono"
          type="number"
          min={key === 'exchangeRate' ? '0.0001' : '0'}
          max={key === 'vatRate' ? '100' : undefined}
          step={step}
          value={document[key]}
          onChange={(event) => update(key, Number(event.target.value))}
        />
      )}
    </Field>
  );
  return (
    <section className="form-bottom" aria-label="เงื่อนไขและยอดรวม">
      <div className="bottom-group">
        <h2>
          <Icon name="box" size={14} />
          เงื่อนไขการส่งมอบ
        </h2>
        {text('deliveryTerm', 'เงื่อนไขการส่งมอบ')}
        {numeric('deliveryWithin', 'ส่งมอบภายใน (วัน)')}
        {numeric('creditDays', 'เครดิต (วัน)')}
        {text('bookCode', 'รหัสสมุดเงิน')}
        {text('department', 'รหัสแผนก')}
        {text('contact', 'รหัสผู้ติดต่อ')}
      </div>
      <div className="bottom-group">
        <h2>
          <Icon name="file" size={14} />
          ข้อมูลเพิ่มเติม
        </h2>
        {text('salesperson', 'รหัสพนักงานขาย')}
        <Field label="วันที่ส่งมอบ">
          {(id) => (
            <Input
              id={id}
              type="date"
              value={document.deliveryDate}
              onChange={(event) => update('deliveryDate', event.target.value)}
            />
          )}
        </Field>
        <Field label="วันที่ครบกำหนด">
          {(id) => (
            <Input
              id={id}
              type="date"
              value={document.dueDate}
              onChange={(event) => update('dueDate', event.target.value)}
            />
          )}
        </Field>
        {numeric('exchangeRate', 'อัตราแลกเปลี่ยน', '0.0001')}
        {numeric('vatRate', 'อัตราภาษีมูลค่าเพิ่ม (%)', '0.01')}
        {numeric('shipping', 'ค่าขนส่ง', '0.01')}
      </div>
      <div className="bottom-group totals-group">
        <h2>
          <Icon name="bank" size={14} />
          สรุปยอดเอกสาร<span className="currency-badge">THB</span>
        </h2>
        <div className="summary-row">
          <span>รวมมูลค่าสินค้า</span>
          <output className="mono" aria-label="รวมมูลค่าสินค้า">
            {money(totals.subtotal)}
          </output>
        </div>
        <div className="summary-row">
          <span>มูลค่าสินค้าก่อนภาษี</span>
          <output className="mono" aria-label="มูลค่าสินค้าก่อนภาษี">
            {money(totals.taxBase)}
          </output>
        </div>
        <Field label="ส่วนลดท้ายบิล (บาท)">
          {(id) => (
            <Input
              id={id}
              type="number"
              min="0"
              step="0.01"
              className="number-input mono discount-input"
              value={document.discount}
              onChange={(event) => update('discount', Number(event.target.value))}
            />
          )}
        </Field>
        <div className="summary-row">
          <span>ภาษีมูลค่าเพิ่ม ({document.taxType === 'exempt' ? 0 : document.vatRate}%)</span>
          <output className="mono" aria-label="ภาษีมูลค่าเพิ่ม">
            {money(totals.vat)}
          </output>
        </div>
        <div className="summary-row">
          <span>มูลค่ารวมภาษี</span>
          <output className="mono" aria-label="มูลค่ารวมภาษี">
            {money(totals.taxBase + totals.vat)}
          </output>
        </div>
        <div className="grand-total">
          <span>
            มูลค่าสุทธิ<small>รวมค่าขนส่ง</small>
          </span>
          <output aria-label="มูลค่าสุทธิ" className="mono">
            {money(totals.total)}
            <small>บาท</small>
          </output>
        </div>
      </div>
    </section>
  );
}
