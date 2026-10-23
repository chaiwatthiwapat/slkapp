export interface SalesLine {
  id: string;
  code: string;
  name: string;
  warehouse: string;
  location: string;
  unit: string;
  quantity: number;
  price: number;
  discount: number;
}
export interface SalesDocument {
  id: string;
  number: string;
  type: string;
  taxType: 'exclusive' | 'inclusive' | 'exempt';
  date: string;
  taxNumber: string;
  taxDate: string;
  customerCode: string;
  customerName: string;
  deliveryTerm: string;
  deliveryWithin: number;
  creditDays: number;
  bookCode: string;
  department: string;
  contact: string;
  salesperson: string;
  deliveryDate: string;
  dueDate: string;
  exchangeRate: number;
  vatRate: number;
  shipping: number;
  discount: number;
  note: string;
  lines: SalesLine[];
}
export interface Product {
  code: string;
  name: string;
  unit: string;
  price: number;
  detail: string;
}
export const products: Product[] = [
  {
    code: 'S000002',
    name: 'ค่าขนส่ง เครื่องจักร',
    unit: 'งาน',
    price: 20000,
    detail: 'บริการขนส่งและเคลื่อนย้ายเครื่องจักร',
  },
  {
    code: 'S000003',
    name: 'ค่าบริการติดตั้ง',
    unit: 'งาน',
    price: 5000,
    detail: 'บริการติดตั้งและทดสอบระบบ',
  },
  {
    code: 'S000004',
    name: 'ค่าบริการบำรุงรักษา',
    unit: 'ครั้ง',
    price: 2500,
    detail: 'บริการตรวจเช็กและบำรุงรักษา',
  },
];
export const customers = [
  {
    code: '0115562031875',
    name: 'บริษัท ทีทีเค เทคโนพลัส จำกัด',
    detail: 'สำนักงานใหญ่ · กรุงเทพมหานคร',
  },
  {
    code: '0105559012345',
    name: 'บริษัท สยาม อินดัสทรี จำกัด',
    detail: 'สำนักงานใหญ่ · สมุทรปราการ',
  },
  { code: 'CASH', name: 'ลูกค้าทั่วไป', detail: 'ลูกค้าเงินสด' },
];
export function blankLine(): SalesLine {
  return {
    id: crypto.randomUUID(),
    code: '',
    name: '',
    warehouse: '',
    location: '',
    unit: '',
    quantity: 0,
    price: 0,
    discount: 0,
  };
}
export function createDocument(sample = false): SalesDocument {
  const lines = Array.from({ length: 25 }, blankLine);
  if (sample) lines[0] = { ...lines[0], ...products[0], quantity: 1 };
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return {
    id: sample ? 'sample-iv690248' : crypto.randomUUID(),
    number: sample ? 'IV690248' : `DRAFT-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
    type: 'ขายบริการเงินสด',
    taxType: 'exclusive',
    date: sample ? '2026-09-29' : date,
    taxNumber: '',
    taxDate: '',
    customerCode: sample ? customers[0].code : '',
    customerName: sample ? customers[0].name : '',
    deliveryTerm: '',
    deliveryWithin: 0,
    creditDays: 0,
    bookCode: '',
    department: '',
    contact: '',
    salesperson: '',
    deliveryDate: '',
    dueDate: '',
    exchangeRate: 1,
    vatRate: 7,
    shipping: 0,
    discount: sample ? 1000 : 0,
    note: '',
    lines,
  };
}
export const isActiveLine = (line: SalesLine) =>
  Boolean(line.code || line.name || line.quantity || line.price || line.discount);
const cents = (value: number) => Math.round(value * 100);
export function lineTotal(line: SalesLine): number {
  return Math.max(0, Math.round(line.quantity * cents(line.price)) - cents(line.discount)) / 100;
}
export function calculateTotals(document: SalesDocument) {
  const subtotal = document.lines.reduce((sum, line) => sum + cents(lineTotal(line)), 0);
  const afterDiscount = Math.max(0, subtotal - cents(document.discount));
  const base =
    document.taxType === 'inclusive'
      ? Math.round(afterDiscount / (1 + document.vatRate / 100))
      : afterDiscount;
  const vat =
    document.taxType === 'exempt'
      ? 0
      : document.taxType === 'inclusive'
        ? afterDiscount - base
        : Math.round((base * document.vatRate) / 100);
  return {
    subtotal: subtotal / 100,
    taxBase: base / 100,
    vat: vat / 100,
    total: (base + vat + cents(document.shipping)) / 100,
  };
}
export const money = (value: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    value,
  );
export function validateDocument(document: SalesDocument): string | null {
  if (!document.number.trim()) return 'กรุณาระบุเลขที่เอกสาร';
  if (!document.date) return 'กรุณาระบุวันที่ออกเอกสาร';
  if (!document.customerCode.trim() || !document.customerName.trim()) return 'กรุณาเลือกลูกค้า';
  const lines = document.lines.filter(isActiveLine);
  if (!lines.length) return 'กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ';
  for (const line of lines) {
    if (!line.code.trim() || !line.name.trim()) return 'กรุณาระบุรหัสและชื่อสินค้าให้ครบทุกรายการ';
    if (
      ![line.quantity, line.price, line.discount].every(Number.isFinite) ||
      line.quantity <= 0 ||
      line.price < 0 ||
      line.discount < 0
    )
      return 'จำนวนต้องมากกว่า 0 และราคา / ส่วนลดต้องไม่ติดลบ';
    if (line.discount > line.quantity * line.price) return 'ส่วนลดรายการต้องไม่มากกว่ามูลค่ารายการ';
  }
  const numbers = [
    document.discount,
    document.shipping,
    document.vatRate,
    document.exchangeRate,
    document.deliveryWithin,
    document.creditDays,
  ];
  if (
    !numbers.every((value) => Number.isFinite(value) && value >= 0) ||
    document.exchangeRate <= 0 ||
    document.vatRate > 100
  )
    return 'กรุณาตรวจสอบส่วนลด ค่าขนส่ง อัตราแลกเปลี่ยน และอัตราภาษี';
  if (document.discount > calculateTotals(document).subtotal)
    return 'ส่วนลดท้ายบิลต้องไม่มากกว่ามูลค่าสินค้า';
  return null;
}
