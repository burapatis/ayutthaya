# อยุธยาของเรา | Our Ayutthaya

เว็บไซต์ระยะที่ 1 สำหรับโครงการวิจัยและสื่อดิจิทัลอิสระโดย **Boorapatis Ploysuwan**

## แนวคิด

เว็บไซต์นี้เล่าอยุธยาในฐานะเมืองที่ยังมีชีวิต โดยเน้นสถานที่ พื้นที่ อาหาร วัตถุ กิจกรรมสาธารณะ และบริบทประวัติศาสตร์ ระยะต้นหลีกเลี่ยงข้อมูลที่ระบุตัวบุคคลหรือกลุ่มบุคคล

## โครงสร้างไฟล์

- `index.html` — โครงสร้างหน้าเว็บและส่วนต่าง ๆ
- `styles.css` — Design system และ responsive layout
- `app.js` — ระบบค้นหา ตัวกรอง Modal ร่างข้อมูล และผู้ช่วย AI แบบต้นแบบ
- `data/content.json` — ชุดข้อมูล Static ที่มีแหล่งอ้างอิงและวันที่ทบทวน

## การใช้งาน

เว็บไซต์ไม่มี dependency ภายนอกที่จำเป็นต่อการทำงานหลัก สามารถเปิดผ่าน Static Hosting ได้โดยตรง เช่น GitHub Pages หรือ Cloudflare Pages

## GitHub + Cloudflare Auto Deploy

โครงการเตรียม Workflow สำหรับ Cloudflare Workers Static Assets ไว้แล้ว:

- `wrangler.jsonc` — ระบุชื่อ Worker `ourayutthaya` และโฟลเดอร์ไฟล์ที่จะเผยแพร่
- `scripts/prepare-worker.mjs` — คัดลอกไฟล์ต้นทางจาก root และ `data/content.json` ไปยัง `dist/client`
- `.github/workflows/deploy-cloudflare-worker.yml` — ตรวจสอบข้อมูลและ Deploy อัตโนมัติเมื่อ Push เข้า branch `main`

### วิธีเปิดใช้งาน

1. สร้าง GitHub repository แล้วนำชุดไฟล์นี้ขึ้นไป โดยใช้ branch หลักชื่อ `main`
2. ไปที่ `Settings → Secrets and variables → Actions` ของ repository
3. เพิ่ม Repository secrets สองรายการ:
   - `CLOUDFLARE_API_TOKEN` — API Token สำหรับ Deploy Worker โดยจำกัดสิทธิ์และ Account ให้แคบที่สุด
   - `CLOUDFLARE_ACCOUNT_ID` — Account ID ของ Cloudflare
4. Push การเปลี่ยนแปลงเข้า `main` หรือเลือก `Actions → Deploy Our Ayutthaya to Cloudflare Workers → Run workflow`

หลังจาก Workflow สำเร็จ การเปลี่ยนแปลงที่อยู่ใน root เช่น `index.html`, `styles.css`, `app.js` และ `data/content.json` จะถูกเตรียมและส่งไปยัง Worker อัตโนมัติ โดเมนที่ผูกกับ Worker อยู่แล้ว เช่น `ayutthaya.thamdee.com` จะยังใช้การตั้งค่าเดิมของ Cloudflare

ห้ามใส่ API Token ในไฟล์เว็บไซต์ ใน Git หรือในข้อความสนทนา หากต้องการทดสอบจากเครื่องของผู้จัดทำ ให้ใช้การเข้าสู่ระบบของ Wrangler หรือ Secret Manager ที่ปลอดภัยแทน

ชุดข้อมูลระยะแรกเน้นสถานที่ วัตถุ อาหาร เมือง สายน้ำ พิพิธภัณฑ์ เครื่องมือ และคลังเหตุการณ์สาธารณะ โดยหลีกเลี่ยงโปรไฟล์บุคคลหรือกลุ่มบุคคล ข้อมูลเวลาเปิดทำการ ค่าธรรมเนียม และกิจกรรมเป็นข้อมูลที่อาจเปลี่ยนแปลง ต้องเปิดแหล่งทางการตรวจสอบก่อนเดินทาง

ในระยะถัดไปควรเพิ่ม:

1. Content schema validation
2. Git-based editor สำหรับสร้าง Pull Request
3. Server-side AI endpoint เพื่อไม่เปิดเผย API Key
4. ระบบตรวจลิขสิทธิ์และลบ EXIF ของภาพ
5. แหล่งอ้างอิงและสถานะตรวจสอบสำหรับข้อมูลทุกชิ้น

## ข้อควรระวัง

ข้อมูลใน `data/content.json` จัดทำจากแหล่งอ้างอิงที่ระบุไว้ในแต่ละรายการ และทบทวน ณ วันที่ 24 สิงหาคม 2569 แต่ไม่ใช่การรับรองข้อมูลหน้างานแบบเรียลไทม์ ห้ามเพิ่มชื่อ เบอร์โทรศัพท์ อีเมลส่วนตัว ใบหน้า หรือข้อมูลระบุตัวบุคคลลงในข้อมูลสาธารณะโดยไม่ผ่านการตรวจสอบที่เหมาะสม
