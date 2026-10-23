import type { IconName } from '../../components/ui';
export interface MenuItem {
  id: string;
  title: string;
  kind: 'sales' | 'planned';
}
export interface MenuGroup {
  id: string;
  title: string;
  icon: IconName;
  items: MenuItem[];
}
export const menuGroups: MenuGroup[] = [
  {
    id: '1',
    title: 'ระบบซื้อและเจ้าหนี้',
    icon: 'box',
    items: [
      { id: '1.1', title: 'ข้อมูลผู้จำหน่าย', kind: 'planned' },
      { id: '1.2', title: 'ใบขอซื้อ', kind: 'planned' },
      { id: '1.3', title: 'ใบสั่งซื้อ', kind: 'planned' },
      { id: '1.4', title: 'ซื้อสินค้าเงินเชื่อ', kind: 'planned' },
    ],
  },
  {
    id: '2',
    title: 'ระบบขายและลูกหนี้',
    icon: 'cart',
    items: [
      { id: '2.1', title: 'ข้อมูลลูกค้า', kind: 'planned' },
      { id: '2.2', title: 'ใบเสนอราคา', kind: 'planned' },
      { id: '2.3', title: 'ใบสั่งขาย', kind: 'planned' },
      { id: '2.12', title: 'ขายสินค้าเงินสด', kind: 'planned' },
      { id: '2.13', title: 'ขายบริการเงินสด', kind: 'sales' },
      { id: '2.14', title: 'ขายบริการเงินเชื่อ', kind: 'planned' },
    ],
  },
  {
    id: '3',
    title: 'ระบบการเงินและธนาคาร',
    icon: 'bank',
    items: [
      { id: '3.1', title: 'รับชำระเงิน', kind: 'planned' },
      { id: '3.2', title: 'จ่ายชำระเงิน', kind: 'planned' },
      { id: '3.3', title: 'บัญชีเงินฝากธนาคาร', kind: 'planned' },
    ],
  },
];
export const salesMenu = menuGroups[1].items.find((item) => item.id === '2.13')!;
