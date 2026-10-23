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
| LookupDropdown | ช่องเลือกพร้อม SVG trigger และตาราง popup ใต้ช่อง |
| ContextMenu | เมนูคลิกขวาที่วางใน viewport และเลือกได้ด้วยคีย์บอร์ด |

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

```text
Input style
==========
Input, Select และ textarea ที่ใช้ ui-input มีขอบคม ไม่ rounded
เมื่อ focus ใช้เส้นขอบสีดำจาก --input-focus-border โดยไม่มี outline หรือเงา
ใช้รูปแบบเดียวกันในฟอร์ม, ตาราง และ lookup
ปุ่มค้นหาที่ติดกับช่องกรอกใช้ขอบคมเช่นกัน
```

```text
Lookup dropdown
==========
LookupDropdown ใช้ items, value และ onSelect โดยเก็บค่าที่เลือกเป็น code และแสดง name
กำหนด width, height, color, backgroundColor, style และ popupWidth ได้
ใช้ shared Table แสดงคอลัมน์ No และ Description ตามจำนวนข้อมูลจริง ไม่มีแถวว่างเพิ่ม
กดปุ่ม SVG หรือช่องกรอกเพื่อเปิด เลือกแถวแล้วปิดและคืน focus กลับช่องกรอก
ใช้ ArrowUp / ArrowDown, Home / End และ Enter เพื่อเลือก; Escape ยกเลิก
คลิกนอก popup หรือเลื่อน focus ออกจะปิดโดยไม่เปลี่ยนค่า

Document lookup icon
----------
ใช้ Icon name="document-lookup" เป็น SVG เอกสารสีขาวพร้อมรายละเอียดสีส้ม
วาดบนกริด 16×16 ใช้เส้นหนา 1px และสีเข้มเพื่อให้ชัดเมื่อแสดงขนาดจริง
ปุ่มข้างช่องใช้กรอบเหลี่ยมสีเทาและพื้นขาวตามรูปแบบโปรแกรมอ้างอิง
ต้นฉบับ vector อยู่ใน components/ui/icons/DocumentLookupArtwork.tsx
กำหนด width, height และ color ผ่าน Icon ได้
ปรับสีรายละเอียดผ่าน CSS variables --icon-paper, --icon-fold, --icon-accent, --icon-shadow
```

## Theme

```text
Cursor
==========
ใช้ cursor: default (ลูกศรปกติ) ทั่วทั้งแอป รวมปุ่ม, ลิงก์, input, select, textarea และตาราง
ครอบคลุม hover, focus, disabled, popup, backdrop และจุดปรับขนาด textarea
ไม่เปลี่ยนเป็น pointer, text, not-allowed หรือ cursor อื่น เว้นแต่ผู้ใช้สั่งเพิ่มโดยตรง
กำหนดกติกากลางใน styles/global.css และไม่เพิ่ม cursor override ใน component โดยพลการ
```

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
แสดงเป็นข้อความปกติ 1. ระบบซื้อและเจ้าหนี้, 2. ระบบขายและลูกหนี้, 3. ระบบการเงินและธนาคาร
navbar และ tabbar สูงเท่ากัน 39px ผ่าน --workspace-bar-height
navbar มีเฉพาะเมนู ไม่มี logo, profile, badge, ปุ่มช่วยเหลือ หรือไอคอนประกอบ
ข้อความ navbar ทุกสถานะ และข้อความปกติใน dropdown รวมเลขเมนูใช้สีดำ #000000 ผ่าน --menu-text
กรอบ dropdown ใช้ padding 8px เท่ากันทุกด้าน รวมด้านบนสุดและล่างสุด
แต่ละรายการใช้ padding บน–ล่าง 4px และซ้าย–ขวา 8px โดยแถวสูงตามข้อความ
เฉพาะรายการใน dropdown ที่ hover เปลี่ยนสีข้อความเป็น primary โดยไม่เติมสีพื้นหลัง
รายการเป็นตัวอย่างเบื้องต้น เพิ่มเมนูได้จากข้อมูลชุดนี้

Tabs
----------
แต่ละเมนูเปิดได้หนึ่งแท็บ โดยใช้ menu id เป็นเอกลักษณ์ของแท็บ
คลิกเมนูเดิมจะ focus แท็บเดิมพร้อมข้อมูลที่กำลังแก้ไข ไม่เปิดแท็บซ้ำ
เปิดหน้าจาก navbar; tabbar ไม่มีปุ่ม + หรือ x
คลิกขวาที่แท็บเพื่อใช้ Close, Close to Left, Close to Right หรือ Close All
Close to Left / Right ปิดเฉพาะแท็บด้านนั้น ไม่รวมแท็บที่คลิก
คำสั่งด้านที่ไม่มีแท็บจะปิดใช้งาน และการคลิกขวาไม่สลับ active tab
หาก active tab ถูกปิดจะเลือกแท็บที่เหลือให้เหมาะสม
ปุ่ม New เริ่มเอกสารใหม่ในแท็บเดิม และยืนยันก่อนทิ้งการแก้ไขที่ยังไม่ได้บันทึก
แต่ละ SaleAndServicePage ถูก mount แยกด้วย tab id ของเมนู
แท็บที่ไม่ active ใช้ hidden เพื่อรักษาข้อมูล, scroll และ state ของหน้านั้นไว้

Keyboard and focus
----------
Tab ใช้ role=tablist / tab / tabpanel และรองรับลูกศรซ้ายขวา, Home, End
เมนูรองรับลูกศรขึ้นลงและ Escape
เปิดเมนูคลิกขวาจากแท็บด้วย Shift+F10 หรือปุ่ม Context Menu ได้เช่นกัน
ContextMenu รองรับ ArrowUp / ArrowDown, Home / End, Enter และ Escape โดยไม่สลับแท็บ
Modal ใช้ native dialog เพื่อจำกัด focus และคืน focus เมื่อปิด

Unsaved changes
----------
แท็บที่แก้ไขมีจุดแสดงสถานะและเตือนก่อนปิด
การปิดหลายแท็บจะยืนยันครั้งเดียวก่อนปิดทั้งกลุ่ม หากยกเลิกจะเก็บทุกแท็บและข้อมูลเดิม
ตรวจเฉพาะข้อมูลในแท็บที่จะปิด จึงไม่เตือนเมื่อแท็บที่แก้ไขเป็นแท็บที่เก็บไว้
ใช้ beforeunload เพื่อขอให้ browser เตือนก่อนออกจากหน้าเมื่อมีข้อมูลที่ยังไม่ได้บันทึก
browser เป็นผู้กำหนดการแสดงข้อความเตือน

Empty workspace
----------
เมื่อไม่มีแท็บจะซ่อน tabbar และแสดง WelcomePage บนพื้นขาวตรงกลางพื้นที่ทำงาน
แสดง ยินดีต้อนรับ, Company: Demo และ User: Demo เป็นข้อมูลสาธิต
เปิดหน้าใหม่จาก navbar แล้ว tabbar จะกลับมาแสดง
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
