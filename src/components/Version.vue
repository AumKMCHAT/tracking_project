<template>
    <v-footer
    padless class="justify-end"
    color="#11b8b8">

    <v-tooltip  
    top
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
          KISRA Tracking project | v1.1 (2022/5/9)
        </v-btn>
      </template>

      <v-responsive
        class="overflow-y-auto"
        max-height="400"
        max-width="280">
        <h3>Version</h3>
        <div>
        v1.1 (2022/5/9) <br>
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