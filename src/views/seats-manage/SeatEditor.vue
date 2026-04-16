<template>
  <div class="seat-editor" v-if="visible">
    <div class="modal-overlay" @click="close"></div>
    <div class="modal-panel">
      <h3>座位信息 - {{ seat && seat.id }}</h3>
      <div class="form">
        <label>Name: <input v-model="form.name" placeholder="座位使用者名称" /></label>
        <label>Department: <input v-model="form.dept" placeholder="部门" /></label>
        <label>Remark: <input v-model="form.remark" placeholder="备注" /></label>
      </div>
      <div class="actions">
        <button @click="save">保存</button>
        <button @click="close">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SeatEditor',
  props: {
    seat: { type: Object, default: null },
    visible: { type: Boolean, default: false },
  },
  data() {
    return {
      form: { name: '', dept: '', remark: '' },
    }
  },
  watch: {
    seat: {
      handler(n) {
        if (n) {
          this.form = {
            name: (n && n.meta && n.meta.name) || '',
            dept: (n && n.meta && n.meta.dept) || '',
            remark: (n && n.meta && n.meta.remark) || '',
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    save() {
      const updated = {
        id: (this.seat && this.seat.id) || null,
        name: this.form.name,
        dept: this.form.dept,
        remark: this.form.remark,
      }
      this.$emit('save', updated)
    },
    close() {
      this.$emit('close')
    },
  },
}
</script>

<style scoped>
.seat-editor {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
}
.modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}
.modal-panel {
  position: relative;
  width: 420px;
  max-width: calc(100% - 40px);
  margin: 80px auto;
  padding: 16px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}
.form label {
  display: block;
  margin: 8px 0;
}
.form input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
</style>
