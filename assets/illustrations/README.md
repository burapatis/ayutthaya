# ภาพประกอบคลังข้อมูล

ภาพในโฟลเดอร์นี้เป็นภาพประกอบที่สร้างด้วย AI เพื่อช่วยนำทางการอ่านเนื้อหา ไม่ใช่ภาพหลักฐานทางประวัติศาสตร์ ภาพถ่ายสถานที่จริง หรือการยืนยันรูปลักษณ์ของวัตถุโบราณ

## ภาษา visual กลาง

- contemporary editorial collage
- กระดาษเก่า หมึกพิมพ์ และ screen-print grain แบบละเอียด
- สีอิฐอยุธยา เหลืองน้ำตาล ส้มอมน้ำตาล น้ำเงินเขียวของแม่น้ำ งาช้าง และ charcoal
- ไม่มีบุคคลที่ระบุตัวตนได้ ไม่มีโลโก้ ไม่มีลายน้ำ และไม่มีข้อความในภาพ
- ใช้ภาพเชิงสัญลักษณ์เมื่อข้อมูลต้นฉบับมีความไม่แน่นอน

## แนวทางเพิ่มภาพรายการใหม่

1. ใช้ชื่อไฟล์เดียวกับ `id` ของรายการ เช่น `new-place-id.png`
2. บันทึกไฟล์เป็น JPEG คุณภาพดี ขนาดด้านยาว 720px หรือต่ำกว่าเพื่อรักษา performance budget
3. เพิ่มฟิลด์ `image: "assets/illustrations/new-place-id.png"` ใน `data/content.json`
4. ระบุในหน้ารายละเอียดเสมอว่าเป็น “ภาพประกอบสร้างด้วย AI”
5. ห้ามใช้ภาพประกอบแทนภาพหลักฐานจริง และห้ามสร้างรายละเอียดทางประวัติศาสตร์ที่ไม่มีแหล่งอ้างอิง

## Prompt ตั้งต้น

```text
Create a square 1:1 contemporary editorial collage for the Ayutthaya knowledge archive. Use warm terracotta, muted saffron, river teal, aged ivory and charcoal, with handmade paper grain and restrained screen-print texture. Show [SUBJECT] as a visual metaphor connected to [CONTENT CONTEXT]. No people, logos, watermark, readable text or invented inscriptions. Do not present it as archaeological evidence or a documentary photograph.
```
