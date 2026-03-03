# Succeed BDMS - User Acceptance Testing Guide

คู่มือนี้จัดทำขึ้นเพื่อใช้ในการทดสอบระบบ Logistics และ Warehouse Management ที่เพิ่งได้รับการพัฒนาล่าสุด (Inbound, Outbound, Shipment Hub)

---

## 🚀 การติดตั้งและรันโปรเจกต์ (Setup)

1. **ติดตั้ง Node.js** (หากยังไม่มี) แนะนำเวอร์ชัน 18 ขึ้นไป
2. **ติดตั้ง Dependencies**:
   เปิด Terminal ในโฟลเดอร์โปรเจกต์ (Succeed_BDMS) และรันคำสั่ง:
   ```bash
   npm install
   ```
3. **กำหนดค่า Database (Environment Variables)**:
   > ⚠️ **สำคัญ:** โปรเจกต์นี้เชื่อมต่อกับฐานข้อมูล Supabase รบกวนขอไฟล์ `.env.local` จากผู้พัฒนา (เจ้าของโปรเจกต์) มาวางไว้ในโฟลเดอร์ นอกสุดของโปรเจกต์ (ระดับเดียวกับ `package.json`)

4. **รันระบบ (Development Server)**:
   ```bash
   npm run dev
   ```
5. **เข้าใช้งานระบบ**:
   เปิด Browser (แนะนำ Google Chrome) แล้วไปที่: **[http://localhost:3000](http://localhost:3000)**

*(หากระบบมีการบังคับ Login สามารถใช้ Account ที่มีอยู่แล้ว หรือให้เจ้าของโปรเจกต์ข้ามการตรวจสอบ (Bypass) ให้ชั่วคราว)*

---

## 🧪 กระบวนการที่ต้องทดสอบ (Test Scenarios)

### 1. ระบบจัดการข้อมูลขนส่ง (Shipment Logistics Management)
**URL:** [http://localhost:3000/dashboard/shipment](http://localhost:3000/dashboard/shipment)

เพื่อเตรียมข้อมูลให้พร้อมก่อนทำรายการ Inbound หรือ Outbound ให้ทดสอบสร้างข้อมูล Master Data ตามลำดับดังนี้:
1. **Logistics Providers (สร้างบริษัทขนส่ง)**
   - ทดสอบกรอกชื่อบริษัท และผู้ติดต่อ
   - ตรวจสอบว่าระบบบันทึก Provider ID อัตโนมัติได้ถูกต้อง (PRV-XXXX)
2. **Customers Directory (สร้างลูกค้า)**
   - ทดสอบกรอกชื่อ ที่อยู่ เบอร์โทร 
   - ตรวจสอบว่าระบบออก Customer ID ให้ (CUS-XXXX)
3. **Drivers Database (สร้างรายชื่อคนขับรถ)**
   - ทดสอบกรอกชื่อคนขับ และ **เลือกบริษัทขนส่ง** จาก Dropdown
   - ตรวจสอบว่าข้อมูลเชื่อมโยงกันถูกต้อง
4. **Create Shipment Run (สร้างรอบรถจัดส่ง)**
   - ทดสอบกรอกป้ายทะเบียนรถ, วัน/เวลา ออกเดินทาง
   - เลือกคนขับรถจาก Dropdown
5. **Active Shipments (ตรวจสอบประวัติรอบรถ)**
   - เข้าไปดูที่เมนู Active Shipments (Log) 
   - เช็คว่ารอบรถที่เพิ่งสร้างตอนข้อ 4. แสดงผลถูกต้อง มีข้อมูลชื่อคนขับ ป้ายทะเบียน และเวลาครบถ้วน

---

### 2. ระบบนำเข้าสินค้า (Inbound Hub)
**URL:** [http://localhost:3000/dashboard/inbound/create](http://localhost:3000/dashboard/inbound/create)

1. **สร้างออเดอร์นำเข้า (Create Inbound Order)**
   - กรอกข้อมูล Invoice No., Container No.
   - **ทดสอบเลือก Provider** (บริษัทขนส่ง) จาก Data ที่สร้างไว้ในข้อ 1
   - กดยืนยันการสร้าง (ระบบจะไม่ใช้อัปโหลด Excel ในขั้นตอนนี้แล้ว)
2. **การตรวจรับของ (Inbound Unload)**
   - เข้าไปที่ `/dashboard/inbound/unload` (หรือคลิกจากตารางใน History)
   - ทดสอบอัปโหลดไฟล์ Excel เพื่อเทียบจำนวนสินค้า (ระบบจะรวมจำนวน Part ID ที่ซ้ำกันใน Excel ให้อัตโนมัติแล้ว)
   - สังเกตหน้าจอว่าระบบดึงข้อมูลถูกต้องหรือไม่

---

### 3. ระบบเบิกจ่ายสินค้า (Outbound Hub)
**URL:** [http://localhost:3000/dashboard/outbound/create](http://localhost:3000/dashboard/outbound/create)

ระบบนี้ได้เปลี่ยนจากการ **Auto-Reserve (จองของอัตโนมัติ)** มาเป็นระบบ **Manual Pick (ไปหยิบของแล้วค่อยสแกน)**
1. **สร้างแผนการเบิกสินค้า (Outbound Plan)**
   - อัปโหลดไฟล์ Excel ออเดอร์ลูกค้าลงระบบ
   - ระบบจะยังไม่ไปตัดสต็อก แต่จะเข้าสู่สถานะ **Pending** 
2. **การหยิบสินค้าจริง (Manual Picking)**
   - เข้าไปที่เมนูจัดของ (`/dashboard/outbound/pick`)
   - เลือกลิสต์ที่ติด Pending
   - **ทดสอบจำลองการสแกน Serial Number**: หน้าจอจะแสดงรายการที่ต้องกระทำ สแกน/กรอก Serial Number ให้ตรงกับ Part ID นั้น
   - ของชิ้นนั้นจะถูกจองและเปลี่ยนสถานะเป็น **"In Transit"** ทันทีหลังสแกนสำเร็จ

---

## 📌 จุดที่ควรสังเกตและแจ้งฟีดแบค (Feedback Form)
หากพบปัญหา สามารถจดบันทึกตามหัวข้อต่อไปนี้ส่งให้เพื่อนได้เลย:
- [ ] มีหน้าจอไหนพัง หรือกดแล้ว Error (500) หรือหน้าขาวไปเลยหรือไม่?
- [ ] การเชื่อมโยง Dropdown ปกติไหม (เช่น สร้าง Provider ปุ๊บ ไปโผล่ให้เลือกตอนสร้าง Inbound ได้เลยมั้ย)
- [ ] สแกน Serial Number ตอน Outbound ผิดตัว ระบบขึ้นเตือนปกติหรือไม่?
- [ ] หน้าตา UI หรือข้อความภาษาไทยส่วนไหนที่ยังอ่านแล้วงง

**ขอบคุณที่ช่วยทดสอบระบบ! 🙌**
