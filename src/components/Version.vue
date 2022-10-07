<template>
    <v-footer
    padless class="justify-end"
    color="#11b8b8">

    <v-tooltip  
    top
    open-delay="200"
    min-width="280"
    color="#11b8b8">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="#11b8b8"
          dark
          elevation="0"
          v-bind="attrs"
          v-on="on"
        >
          KISRA Tracking project | v1.3 (2022/05/25)
        </v-btn>
      </template>

      <v-responsive
        class="overflow-y-auto"
        max-height="400"
        max-width="280">
        <h3>Version</h3>
        <div>
        v1.4 (2022/09/05) <br>
        - แสดงเปอร์เซ็นในกราฟแท่ง <br>
        - แบ่งกราฟให้เป็นจำนวนชั่วโมงในการทำงานของโปรเจ็คนั้นๆ <br>
        - เรียงการแสดงกราฟจากมากไปน้อย <br>
        - ลงข้อมูลคนขอลาอนุมัติแล้ว ไปลงใน sheet หน้า ลงวันลาที่อนุมัติแล้ว <br>
        v1.3 (2022/05/25) <br>
        - เพิ่มการเช็ค trcking สำหรับการลา <br>
        - สรุปการ tracking หลังอนุมัติการลา <br>
        v1.2 (2022/05/20) <br>
        - เพิ่มการค้นหาในช่อง employees <br>
        - ปรับข้อมูลการแสดงผลหน้าsummary <br>
        - เพิ่มแบบฟอร์มการลา และหน้าอนุมัติการลา <br>
        - เปลี่ยนช่วงเวลาที่เลือกได้ของกราฟ <br>
        v1.1 (2022/05/09) <br>
        - เพิ่มการคำนวณสัปดาห์สำหรับฟอร์ม <br>
        - เปลี่ยนชื่อใน manu tab และ ชื่อหัวข้อฟอร์ม <br>
        - เปลี่ยน font ใน cornfirm alert <br>
        - เพิ่มวันที่และรายละเอียดของแต่ละversion <br>
        - เปลี่ยนรูปแบบกราฟจากแนวนอนเป็นแนวตั้ง <br>
        - เพิ่มกราฟวงกลมในหน้า summary <br>
        - เพิ่มส่วนผลรวมรายโปรเจคจากกราฟ<br>
        </div>
      </v-responsive>
    </v-tooltip>
    </v-footer>
</template>

<style>

</style>