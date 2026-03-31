<template>
  <Teleport to="body">
    <Transition name="vp-modal">
      <div v-show="visible" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" ref="modalRef" @click.stop>
          <div class="glass-highlight"></div>

          <div class="glass-noise"></div>

          <div class="modal-content-wrapper">
            <div class="modal-header">
              <h3 class="modal-title">{{ title }}</h3>
              <div class="modal-close" @click="handleClose">
                <CloseOutlined />
              </div>
            </div>

            <div class="modal-content">
              <slot />
            </div>
            <div class="modal-footer" v-if="$slots.footer">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { CloseOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  visible: Boolean,
  title: String,
  closeOnClickOverlay: { type: Boolean, default: true },
})

const emit = defineEmits(['update:visible', 'close'])
const modalRef = ref<HTMLElement | null>(null)

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) handleClose()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  perspective: 1200px;
}

.modal-container {
  position: relative;
  max-width: 92vw;
  max-height: 90vh;
  border-radius: 30px;
  overflow: hidden;

  background: rgba(255, 255, 255, 0.18);

  backdrop-filter: blur(22px) saturate(1.9);
  -webkit-backdrop-filter: blur(22px) saturate(1.9);

  border: 1px solid rgba(255, 255, 255, 0.45);

  box-shadow:
    0 60px 50px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.65),
    inset 0 -1px 0 rgba(255, 255, 255, 0.25);

  transform-style: preserve-3d;
  transition: transform 0.25s ease-out;
}

.modal-container::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;

  background: linear-gradient(
    120deg,
    rgba(255, 0, 150, 0.15),
    rgba(0, 255, 255, 0.12),
    rgba(255, 255, 255, 0.18)
  );

  mix-blend-mode: overlay;
  opacity: 0.35;
}

.glass-noise {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.28;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
}

.modal-content-wrapper {
  position: relative;
  z-index: 3;
  background: rgba(255, 255, 255, 0.32);
  backdrop-filter: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

.modal-header {
  padding: 18px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.modal-content {
  padding: 10px 22px;
  color: #2a2a2a;
  line-height: 1.7;
}

.modal-footer {
  padding: 16px 22px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
}

.vp-modal-leave-active {
  animation: vp-modal-out 0.5s cubic-bezier(0.4, 0, 0.6, 1);
  transform-origin: center;
}

@keyframes vp-modal-in {
  0% {
    transform: translateY(48px) scale(0.88);
  }

  55% {
    transform: translateY(-6px) scale(1.02);
  }

  100% {
    transform: translateY(0) scale(1);
  }
}

@keyframes vp-modal-out {
  0% {
    transform: translateY(0) scale(1);
  }

  40% {
    transform: translateY(6px) scale(0.9);
  }

  100% {
    transform: translateY(28px) scale(0);
  }
}
</style>
