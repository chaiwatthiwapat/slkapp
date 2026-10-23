# SLK App Documentation

```text
Overview
==========
จุดเริ่มต้นสำหรับเอกสารและแนวทางพัฒนาโปรเจกต์
อ่านหน้านี้ก่อนแก้ไขโค้ด
```

## Document index

| เอกสาร | เนื้อหา |
|---|---|
| [Architecture](architecture.md) | โครงสร้าง repo, Docker, API และขอบเขต backend |
| [UI guide](ui-guide.md) | Shared UI, theme, navbar, tabs และ layout |
| [Sale and service](sale-and-service.md) | หน้า 2.13, ข้อมูลสาธิต, การคำนวณ และข้อจำกัด |
| [Development](development.md) | คำสั่งพัฒนาและการตรวจสอบ |
| [Docs format guide](docs-format-guide.md) | รูปแบบเอกสารที่คัดลอกจาก zdotfiles |

## Development conventions

```text
Documentation
==========
README หลักมีเฉพาะ setup และ run; เอกสารรายละเอียดวางใน docs/
ตรวจสอบเอกสารเมื่อ behavior เปลี่ยน

Format
----------
ใช้ # และ ## สำหรับหัวข้อ Markdown
วางคำอธิบายในบล็อก text โดยใช้ ========== ใต้หัวข้อหลักและ ---------- ใต้หัวข้อย่อยภายในบล็อก
บล็อก bash ทุกบล็อกเริ่มด้วย # ---------- bash ---------- # แล้วเว้นหนึ่งบรรทัดก่อนคำสั่ง
ตาราง Markdown และลิงก์อ้างอิงอยู่นอก code block เพื่อให้แสดงผลและกดได้
คง docs-format-guide.md ตามต้นฉบับที่คัดลอกมา

Implementation
==========
ใช้ React + TypeScript + CSS และแยก frontend/backend ใน repo เดียว
ใช้ shared UI จาก frontend/src/components/ui แทนการสร้าง component ซ้ำในแต่ละหน้า
ใช้สีจาก frontend/src/styles/tokens.css และรองรับขนาดผ่าน props ของ component
ใช้ cursor: default (ลูกศรปกติ) ทุกส่วนและทุกสถานะ เปลี่ยนรูป cursor ได้เฉพาะเมื่อผู้ใช้สั่ง

Workspace
----------
เก็บ state ของแต่ละหน้าแยกตาม tab id; การสลับแท็บต้องไม่ล้างฟอร์มหรือรายการ
แต่ละเมนูเปิดได้หนึ่งแท็บ การเปิดเมนูเดิมต้องกลับไปแท็บเดิมและคงข้อมูลที่กำลังแก้ไข
คงชื่อส่วนของหน้าเอกสารเป็น button-action, form-top, form-table, form-bottom

Data and authorization
----------
ช่วงเริ่มต้นบันทึกใน browser เท่านั้น ห้ามแสดงว่า backend บันทึกเอกสารหรือรับเงินจริงแล้ว
เคารพข้อกำหนดการอนุมัติจาก AGENTS.md ในโฟลเดอร์แม่ด้วย
```

## Notes

```text
commit 1 line Thai: conventionalcommits.org/en/v1.0.0/
```
