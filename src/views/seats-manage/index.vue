<template>
  <div class="page">
    <div class="toolbar">
      <a-select v-model:value="currentFloor" style="width: 120px">
        <a-select-option v-for="f in floors" :key="f" :value="f">
          {{ f }}
        </a-select-option>
      </a-select>
      <a-button type="primary" @click="addPerson">新增人员</a-button>
      <a-button :type="layoutEdit ? 'primary' : 'default'" @click="toggleLayoutEdit">
        {{ layoutEdit ? '完成编辑' : '编辑人员' }}
      </a-button>
      <div class="zoom-bar">
        <span class="zoom-label">缩放</span>
        <a-button size="small" @click="zoomOut">−</a-button>
        <a-slider
          v-model:value="zoomPercent"
          :min="50"
          :max="200"
          :step="5"
          class="zoom-slider"
        />
        <a-button size="small" @click="zoomIn">+</a-button>
        <span class="zoom-value">{{ zoomPercent }}%</span>
      </div>
    </div>

    <div class="floor-map" @wheel="onWheel">
      <div class="floor-map-inner">
        <div
          class="map-scale-wrap"
          :style="{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
          }"
        >
          <div class="map-layer" ref="layerRef">
            <img :src="floorImage" class="floor-image" alt="楼层平面图" draggable="false" />
            <div
              v-for="anchor in anchors"
              :key="anchor.id"
              class="anchor-point"
              :class="{
                'is-editable': layoutEdit,
                'is-dragging': draggingId === anchor.id,
                'is-selected': selectedId === anchor.id,
              }"
              :style="{ left: anchor.x + '%', top: anchor.y + '%' }"
              @pointerdown="onAnchorPointerDown($event, anchor)"
              @click.stop="onAnchorClick(anchor)"
            >
              <div class="anchor-icon">📍</div>
              <div class="anchor-name">{{ anchor.name || '未命名' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <a-drawer v-model:open="visible" :title="layoutEdit ? '编辑座位信息' : '座位信息'" width="320">
      <template v-if="!layoutEdit">
        <p><strong>姓名：</strong>{{ seatInfo.name }}</p>
        <p><strong>工位：</strong>{{ seatInfo.seat }}</p>
        <p><strong>IP：</strong>{{ seatInfo.ip }}</p>
        <p><strong>部门：</strong>{{ seatInfo.dept }}</p>
        <p><strong>配置：</strong>{{ seatInfo.pc }}</p>
      </template>
      <a-form v-else layout="vertical" class="seat-form">
        <a-form-item label="姓名">
          <a-input v-model:value="seatInfo.name" placeholder="姓名" />
        </a-form-item>
        <a-form-item label="工位">
          <a-input v-model:value="seatInfo.seat" placeholder="工位编号" />
        </a-form-item>
        <a-form-item label="IP">
          <a-input v-model:value="seatInfo.ip" placeholder="IP" />
        </a-form-item>
        <a-form-item label="部门">
          <a-input v-model:value="seatInfo.dept" placeholder="部门" />
        </a-form-item>
        <a-form-item label="配置">
          <a-input v-model:value="seatInfo.pc" placeholder="电脑配置" />
        </a-form-item>
        <a-button type="primary" block @click="saveSeatInfo">保存</a-button>
      </a-form>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'

const floors = ['1楼', '2楼']
const currentFloor = ref('1楼')

const floorImage = '/images/Gseats.png'

const anchors = ref([
  { id: 1, name: '张三', x: 20, y: 15, seat: 'A-01', ip: '192.168.1.101', dept: '研发部', pc: 'i7 / 32G / 1T' },
  { id: 2, name: '李四', x: 35, y: 25, seat: 'A-02', ip: '192.168.1.102', dept: '产品部', pc: 'i5 / 16G / 512G' },
  { id: 3, name: '王五', x: 50, y: 40, seat: 'B-01', ip: '192.168.1.103', dept: '设计部', pc: 'i7 / 32G / 1T' },
  { id: 4, name: '赵六', x: 65, y: 55, seat: 'B-02', ip: '192.168.1.104', dept: '市场部', pc: 'i5 / 16G / 512G' },
  { id: 5, name: '钱七', x: 80, y: 70, seat: 'C-01', ip: '192.168.1.105', dept: '运营部', pc: 'i7 / 32G / 1T' },
  { id: 6, name: '孙八', x: 25, y: 60, seat: 'D-01', ip: '192.168.1.106', dept: '财务部', pc: 'i5 / 16G / 512G' },
  { id: 7, name: '周九', x: 45, y: 80, seat: 'D-02', ip: '192.168.1.107', dept: '人事部', pc: 'i7 / 32G / 1T' },
  { id: 8, name: '吴十', x: 70, y: 30, seat: 'E-01', ip: '192.168.1.108', dept: '销售部', pc: 'i5 / 16G / 512G' },
])

const visible = ref(false)
const layoutEdit = ref(false)
const selectedId = ref(null)
const draggingId = ref(null)
const layerRef = ref(null)

const zoomPercent = ref(100)
const zoom = computed(() => zoomPercent.value / 100)

let dragPointerId = null
let dragMoved = false
let suppressNextAnchorClick = false

const seatInfo = ref({
  name: '',
  seat: '',
  ip: '',
  dept: '',
  pc: '',
})

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function nextId() {
  const ids = anchors.value.map((a) => a.id)
  return ids.length ? Math.max(...ids) + 1 : 1
}

function syncSeatInfoFromAnchor(anchor) {
  seatInfo.value = {
    name: anchor.name,
    seat: anchor.seat,
    ip: anchor.ip,
    dept: anchor.dept,
    pc: anchor.pc,
  }
}

function findAnchor(id) {
  return anchors.value.find((a) => a.id === id)
}

function addPerson() {
  layoutEdit.value = true
  const id = nextId()
  const anchor = {
    id,
    name: '新员工',
    x: 50,
    y: 50,
    seat: '',
    ip: '',
    dept: '',
    pc: '',
  }
  anchors.value.push(anchor)
  selectedId.value = id
  syncSeatInfoFromAnchor(anchor)
  visible.value = true
  message.info('已添加锚点，可拖动到目标位置，并在侧栏填写信息')
}

function toggleLayoutEdit() {
  layoutEdit.value = !layoutEdit.value
  if (!layoutEdit.value) {
    draggingId.value = null
  }
}

function zoomIn() {
  zoomPercent.value = clamp(zoomPercent.value + 10, 50, 200)
}

function zoomOut() {
  zoomPercent.value = clamp(zoomPercent.value - 10, 50, 200)
}

function onWheel(e) {
  if (!e.ctrlKey && !e.metaKey) return
  e.preventDefault()
  const delta = e.deltaY < 0 ? 10 : -10
  zoomPercent.value = clamp(zoomPercent.value + delta, 50, 200)
}

function onAnchorClick(anchor) {
  if (suppressNextAnchorClick) {
    suppressNextAnchorClick = false
    return
  }
  selectedId.value = anchor.id
  syncSeatInfoFromAnchor(anchor)
  visible.value = true
}

function onAnchorPointerDown(e, anchor) {
  if (!layoutEdit.value) return
  if (e.button !== 0) return
  e.preventDefault()
  dragMoved = false
  dragPointerId = e.pointerId
  draggingId.value = anchor.id
  e.currentTarget.setPointerCapture(e.pointerId)

  const onMove = (ev) => {
    if (ev.pointerId !== dragPointerId) return
    const layer = layerRef.value
    if (!layer) return
    const rect = layer.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    if (w <= 0 || h <= 0) return
    const nx = ((ev.clientX - rect.left) / w) * 100
    const ny = ((ev.clientY - rect.top) / h) * 100
    anchor.x = clamp(nx, 0, 100)
    anchor.y = clamp(ny, 0, 100)
    dragMoved = true
  }

  const onUp = (ev) => {
    if (ev.pointerId !== dragPointerId) return
    if (dragMoved) suppressNextAnchorClick = true
    e.currentTarget.releasePointerCapture(dragPointerId)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
    draggingId.value = null
    dragPointerId = null
    dragMoved = false
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
}

function saveSeatInfo() {
  const a = findAnchor(selectedId.value)
  if (!a) {
    message.warning('未选中座位')
    return
  }
  a.name = seatInfo.value.name
  a.seat = seatInfo.value.seat
  a.ip = seatInfo.value.ip
  a.dept = seatInfo.value.dept
  a.pc = seatInfo.value.pc
  message.success('已保存')
}

watch(visible, (open) => {
  if (!open) {
    selectedId.value = null
  }
})
</script>

<style scoped>
.page {
  height: 100vh;
  background: #0b0f1a;
  color: #fff;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.3);
}

.zoom-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  min-width: 220px;
}

.zoom-label,
.zoom-value {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
}

.zoom-value {
  width: 44px;
  text-align: right;
}

.zoom-slider {
  width: 120px;
  margin: 0;
}

.floor-map {
  position: relative;
  width: 100%;
  height: calc(100vh - 52px);
  overflow: auto;
  padding: 16px;
  box-sizing: border-box;
}

.floor-map-inner {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100%;
}

.map-scale-wrap {
  flex-shrink: 0;
}

.map-layer {
  position: relative;
  display: inline-block;
  line-height: 0;
}

.floor-image {
  display: block;
  max-width: min(100vw - 48px, 1400px);
  width: auto;
  height: auto;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}

.anchor-point {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.15s;
  z-index: 10;
  touch-action: none;
}

.anchor-point.is-editable {
  cursor: grab;
}

.anchor-point.is-dragging {
  cursor: grabbing;
  z-index: 20;
}

.anchor-point.is-selected .anchor-name {
  box-shadow: 0 0 0 2px #ffd666, 0 2px 8px rgba(0, 212, 255, 0.35);
}

.anchor-point:hover:not(.is-dragging) {
  transform: translate(-50%, -50%) scale(1.08);
}

.anchor-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  pointer-events: none;
}

.anchor-name {
  background: rgba(0, 212, 255, 0.9);
  color: #000;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3);
  pointer-events: none;
}

</style>
