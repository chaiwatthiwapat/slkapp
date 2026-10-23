# SLK App

## Docker

```text
Requirements
==========
ติดตั้ง Docker Engine, Docker Compose v2 และ GNU Make
รันคำสั่งจากโฟลเดอร์โปรเจกต์
```

```bash
# ---------- bash ---------- #

# Build และเริ่ม frontend + backend
make run

# หยุดระบบ
make down
```

เปิด [http://localhost:8002](http://localhost:8002)

## Local development

```text
Requirements
==========
ใช้ Node.js 24 LTS และ npm 11 ขึ้นไป
หยุด Docker ก่อนเพื่อให้พอร์ต 8002 ว่าง และกด Ctrl+C เพื่อหยุด dev server
```

```bash
# ---------- bash ---------- #

# หยุด Docker
make down

# ติดตั้ง dependency และเริ่ม dev server
npm ci
npm run dev
```

เปิด [http://localhost:8002](http://localhost:8002)

เอกสารเพิ่มเติม: [docs/README.md](docs/README.md)
