# Architecture

## Repository

```text
Structure
==========
slkapp/
  frontend/                 React + TypeScript + Vite
    src/components/ui/      Shared UI และ SVG icon
    src/features/workspace/ Navbar และ menu registry
    src/features/sale-and-service/  เมนู 2.13 ขายสินค้า, บริการ
    src/styles/             Theme และ application layout
  backend/src/              Express + TypeScript API
  docker/                   Dockerfiles และ Nginx configuration
  tests/                    Browser workflow tests
  docs/                     เอกสารทั้งหมด
  compose.yaml
  Makefile

Workspaces
----------
ใช้ npm workspaces และ package-lock.json เดียวที่ root
เพื่อให้ npm ci ได้ dependency ชุดเดียวกัน
```

## Feature naming

| เมนู | English name | ชื่อไทย | Source |
|---|---|---|---|
| 2.13 | sale-and-service | ขายสินค้า, บริการ | frontend/src/features/sale-and-service/ |

```text
Entry points
==========
SaleAndServicePage.tsx คือ component หลักของเมนู 2.13
sale-and-service.css คือ stylesheet ของหน้า
model.ts เก็บ SaleAndServiceDocument และ SaleAndServiceLine
storage.ts จัดการข้อมูลเอกสารใน browser
menu.ts ใน features/workspace/ กำหนด nameEn และชื่อแสดงผลของเมนู

Tabs
----------
เมนูเดียวเปิดได้หนึ่งแท็บ เลือกเมนูเดิมหรือกด + จะกลับไปแท็บเดิม
New เริ่มเอกสารใหม่ในแท็บเดิม และยืนยันก่อนทิ้งข้อมูลที่ยังไม่ได้บันทึก
```

เอกสารประจำเมนู: [Sale and service](sale-and-service.md)

## Runtime

| ช่องทาง | Docker | Local development |
|---|---|---|
| Browser | localhost:8002 → Nginx | localhost:8002 → Vite |
| Frontend | ไฟล์ production build | HMR จาก Vite |
| /api/* | Nginx proxy → api:3001 | Vite proxy → 127.0.0.1:3001 |
| Backend | Node.js + Express ใน internal network | tsx watch ที่พอร์ต 3001 |

```text
Docker
==========
เปิดพอร์ต host เฉพาะ 8002 ส่วน API ใช้เครือข่ายภายใน Compose
web รอให้ healthcheck ของ api ผ่านก่อนเริ่ม
ระบบรันแบบ detached และ make run รอให้ service healthy

Development
----------
แก้โค้ดแล้วใช้ make run เพื่อ rebuild สำหรับ Docker
หรือใช้ npm run dev เพื่อพัฒนาพร้อม HMR
```

## API scaffold

```text
Health endpoint
==========
GET /api/health คืนค่า JSON ตามตัวอย่างด้านล่าง

Scope
----------
/api ที่ไม่รู้จักคืน 404 แบบ JSON
ปัจจุบันยังไม่มีฐานข้อมูล, authentication หรือ CRUD สำหรับเอกสารขาย
backend นี้มีไว้ตรวจการเชื่อมต่อและเป็นตำแหน่งเพิ่ม API ต่อไป
```

```json
{
  "status": "ok",
  "service": "slkapp-api",
  "version": "0.1.0"
}
```

## Sale and service storage

```text
Persistence
==========
UI ใช้ localStorage key slkapp.sales.v1 ผ่าน features/sale-and-service/storage.ts
คง storage key เดิมไว้เพื่อให้เอกสารที่บันทึกก่อนเปลี่ยนชื่อยังเปิดใช้งานได้
บันทึกเมื่อกด Save หรือ Ctrl+S / Cmd+S เท่านั้น
ไม่ autosave และไม่ส่งข้อมูลเอกสารไป backend

Tab lifecycle
----------
การเปิดแท็บและ active tab อยู่ในหน่วยความจำ
หลัง reload จะเปิดเอกสารที่มีอยู่ชุดแรก ส่วนแท็บที่ยังไม่บันทึกจะไม่ถูกกู้คืน
หากยังไม่เคยมี storage จะเตรียมเอกสารสาธิต IV690248
```

## References

- [React: preserving component state](https://react.dev/learn/preserving-and-resetting-state)
- [Vite: building for production](https://vite.dev/guide/build.html)
- [Vite: server proxy](https://vite.dev/config/server-options#server-proxy)
- [Docker Compose: startup order](https://docs.docker.com/compose/how-tos/startup-order/)
