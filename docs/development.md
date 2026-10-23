# Development

## Commands

```bash
# ---------- bash ---------- #

# ติดตั้ง dependency ด้วย lockfile
npm ci

# Frontend HMR :8002 + Backend watch :3001
make dev

# ตรวจสอบ TypeScript ทั้งสอง workspace
make check

# TypeScript และ production build
make build

# Build และเริ่ม Docker stack ที่ :8002
make run

# ดู log
make logs

# หยุดและลบ container / network ของโปรเจกต์
make down
```

## Browser tests

```text
Setup
==========
ติดตั้ง Chromium ของ Playwright ครั้งแรก
บาง Linux environment ต้องติดตั้ง system dependency เพิ่มด้วย
```

```bash
# ---------- bash ---------- #

# ติดตั้ง browser
npx playwright install chromium

# ติดตั้ง system dependency เมื่อจำเป็น
npx playwright install-deps chromium

# เริ่ม dev server ชั่วคราวผ่าน Playwright แล้วรัน test
make test
```

```text
Docker
==========
เมื่อรัน Docker อยู่แล้ว ให้ทดสอบกับ Docker โดยตรง
```

```bash
# ---------- bash ---------- #

# ทดสอบผ่าน frontend และ API ที่รันใน Docker
PLAYWRIGHT_BASE_URL=http://localhost:8002 npm run test:e2e
```

```text
Coverage
==========
ทดสอบ navbar / tabs ที่ state แยกกัน, lookup, การคำนวณยอดและภาษี
save / reload, validation, ปิดแท็บที่มีการแก้ไข, delete
พื้นที่ตาราง, mobile layout และ API health

Artifacts
----------
ผล test และ screenshot เมื่อเกิดข้อผิดพลาดอยู่ใน test-results/
โฟลเดอร์นี้ไม่ถูก track ใน Git
```

## Backend readiness

```bash
# ---------- bash ---------- #

# ตรวจสอบ API และสถานะ container
curl --fail http://localhost:8002/api/health
docker compose ps
```

## Troubleshooting

```text
Port 8002
==========
พอร์ต 8002 ถูกใช้: หยุด instance เดิมก่อนเริ่ม Docker หรือ dev server

Docker daemon
----------
Docker ติดต่อ daemon ไม่ได้: เริ่ม Docker service และตรวจสิทธิ์ของผู้ใช้

Rebuild
----------
แก้โค้ดแล้ว Docker ยังแสดงหน้าเดิม: ใช้ make run เพื่อ rebuild

Browser storage
----------
Save ไม่สำเร็จ: ตรวจข้อความ validation และพื้นที่ / สิทธิ์ localStorage ของ browser
ข้อมูลไม่ปรากฏใน browser อื่น: ขณะนี้ข้อมูลจัดเก็บเฉพาะ browser เดิม
```

รายละเอียดการจัดเก็บข้อมูล: [Sales UI](sales-ui.md)
