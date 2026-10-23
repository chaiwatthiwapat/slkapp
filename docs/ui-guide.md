# UI guide

## Shared components

```text
Imports
==========
Import จาก frontend/src/components/ui/index.ts
```

| Component | หน้าที่ |
|---|---|
| Button | solid, soft, outline, ghost และ semantic tones |
| Input / Select | ช่องกรอกข้อมูลและ dropdown |
| Field | Label ที่เชื่อมกับ input ผ่าน id |
| Icon | SVG จากชื่อ icon และ currentColor |
| Modal | Native dialog, focus handling, Escape และ backdrop |
| Table | Typed columns, sticky header และพื้นที่ scroll |
| Lookup | Modal + search + table สำหรับเลือกข้อมูล |

```text
Appearance
==========
ทุก component รองรับ width, height, color, backgroundColor และ style ผ่าน Appearance
Icon เพิ่ม size และ SVG props ได้
ขนาดแบบ number ใช้หน่วย px หรือส่ง string เช่น 100%, 40rem และ min(80vw, 900px)
```

```tsx
<Button width={120} height={36} tone="primary" variant="solid">
  Save
</Button>
<Input width="100%" height={32} color="var(--text)" />
<Icon name="search" width={18} height={18} color="var(--primary)" />
<Modal open={open} title="ข้อมูล" width="48rem" height="70dvh" onClose={close}>
  เนื้อหา
</Modal>
```

```text
Field labels
==========
Field ใช้ render prop เพื่อเชื่อม label กับ input โดยอัตโนมัติ
```

```tsx
<Field label="เลขที่เอกสาร" required>
  {id => <Input id={id} value={number} onChange={changeNumber} />}
</Field>
```

## Theme

```text
Tokens
==========
กำหนดสีใน src/styles/tokens.css ได้แก่ primary, secondary, success, warning, danger, neutral
พร้อม soft color และตัวแปร surface, canvas, text, border, radius
ใช้ CSS variables เพื่อเปลี่ยนธีมได้จากจุดเดียว
```

## Workspace

```text
Navbar
==========
Navbar หลักเรียงแนวนอน 3 ระบบ โดย menu registry อยู่ใน features/workspace/menu.ts
รายการเป็นตัวอย่างเบื้องต้น เพิ่มเมนูได้จากข้อมูลชุดนี้

Tabs
----------
แต่ละเมนูเปิดได้หนึ่งแท็บ โดยใช้ menu id เป็นเอกลักษณ์ของแท็บ
คลิกเมนูเดิมจะ focus แท็บเดิมพร้อมข้อมูลที่กำลังแก้ไข ไม่เปิดแท็บซ้ำ
ปุ่ม + เปิดหรือกลับไปเมนูขายสินค้า, บริการด้วยกติกาเดียวกัน
ปุ่ม New เริ่มเอกสารใหม่ในแท็บเดิม และยืนยันก่อนทิ้งการแก้ไขที่ยังไม่ได้บันทึก
แต่ละ SaleAndServicePage ถูก mount แยกด้วย tab id ของเมนู
แท็บที่ไม่ active ใช้ hidden เพื่อรักษาข้อมูล, scroll และ state ของหน้านั้นไว้

Keyboard and focus
----------
Tab ใช้ role=tablist / tab / tabpanel และรองรับลูกศรซ้ายขวา, Home, End
เมนูรองรับลูกศรขึ้นลงและ Escape
Modal ใช้ native dialog เพื่อจำกัด focus และคืน focus เมื่อปิด

Unsaved changes
----------
แท็บที่แก้ไขมีจุดแสดงสถานะและเตือนก่อนปิด
ใช้ beforeunload เพื่อขอให้ browser เตือนก่อนออกจากหน้าเมื่อมีข้อมูลที่ยังไม่ได้บันทึก
browser เป็นผู้กำหนดการแสดงข้อความเตือน
```

## Document layout

| ส่วน | หน้าที่ |
|---|---|
| button-action | คำสั่งเอกสาร |
| form-top | ข้อมูลเอกสารและลูกค้า |
| form-table | รายการสินค้าและบริการ |
| form-bottom | เงื่อนไข, ข้อมูลเพิ่มเติม และยอดรวม |

```text
Desktop
==========
ใช้ flex column เต็มพื้นที่ workspace โดย form-top และ form-bottom ไม่ยืด
form-table ใช้ flex: 1 และ min-height พร้อม scroll ภายใน
หากหน้าจอเตี้ยมาก workspace จะ scroll ได้เพื่อรักษาขนาดช่องกรอก

Mobile
----------
หน้าจอแคบจะเรียงฟอร์มเป็นคอลัมน์เดียว
ตารางเลื่อนแนวนอนโดย header ติดด้านบน

Print
----------
มี print stylesheet สำหรับพิมพ์เฉพาะเอกสาร active
```
