<template>
  <Teleport to="body">
    <Transition name="vp-modal">
      <div v-show="visible" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" @click.stop>
          <div class="glass-highlight"></div>
          <div class="glass-noise"></div>
          <div class="modal-content-wrapper">
            <div class="modal-header">
              <h3 class="modal-title">{{ title }}</h3>
              <div class="modal-close" @click="handleClose"><CloseOutlined /></div>
            </div>
            <div class="modal-content"><slot /></div>
            <div class="modal-footer" :class="{ 'ios-footer': showFooter && !$slots.footer }">
              <template v-if="$slots.footer"><slot name="footer" /></template>
              <template v-else-if="showFooter">
                <div class="footer-divider"></div>
                <div class="ios-button-group">
                  <button
                    class="ios-button ios-button-cancel"
                    @click="handleCancel"
                    :disabled="loading"
                  >
                    <span class="ios-button-text">{{ cancelText }}</span>
                  </button>
                  <div class="button-divider"></div>
                  <button
                    class="ios-button ios-button-confirm"
                    @click="handleConfirm"
                    :disabled="loading"
                  >
                    <span class="ios-button-text">{{ confirmText }}</span>
                    <span v-if="loading" class="ios-button-loading">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-dasharray="1,4"
                          stroke-dashoffset="0"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 12 12"
                            to="360 12 12"
                            dur="1s"
                            repeatCount="indefinite"
                          />
                        </path>
                      </svg>
                    </span>
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { CloseOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  visible: Boolean,
  title: String,
  closeOnClickOverlay: { type: Boolean, default: true },
  confirmText: { type: String, default: '确认' },
  cancelText: { type: String, default: '取消' },
  loading: { type: Boolean, default: false },
  showFooter: { type: Boolean, default: true },
})

const emit = defineEmits(['update:visible', 'close', 'confirm', 'cancel'])

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) handleClose()
}

const handleConfirm = () => emit('confirm')

const handleCancel = () => {
  emit('cancel')
  handleClose()
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
  -webkit-user-select: none;
  user-select: none;
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
  overflow-y: auto;
  max-height: 60vh;
  min-width: 50vh;
  scrollbar-width: thin;
  scrollbar-color: rgba(187, 187, 187, 0.4) transparent;
}

.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}


.modal-footer.ios-footer {
  padding: 0;
  display: flex;
  flex-direction: column;
  border-top: none;
}

.footer-divider {
  height: 0.5px;
  background: rgba(60, 60, 67, 0.132);
  margin: 0;
}

.ios-button-group {
  display: flex;
  width: 100%;
  height: 56px;
}

.button-divider {
  width: 0.5px;
  background: rgba(60, 60, 67, 0.127);
  height: 100%;
}

.ios-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.ios-button:active {
  background: rgba(0, 0, 0, 0.05);
}

.ios-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ios-button:disabled:active {
  background: transparent;
}

.ios-button-cancel,
.ios-button-confirm {
  color: #007aff;
}

.ios-button-cancel {
  border-radius: 0 0 0 30px;
}

.ios-button-confirm {
  border-radius: 0 0 30px 0;
}

.ios-button-cancel:active,
.ios-button-confirm:active {
  background: rgba(0, 122, 255, 0.1);
}

.ios-button-text {
  line-height: 1;
  position: relative;
  z-index: 1;
}

.ios-button-loading {
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  animation: spin 1s linear infinite;
}

.modal-footer:not(.ios-footer) {
  padding: 16px 22px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
}

.vp-modal-leave-active {
  animation: vp-modal-out 0.25s cubic-bezier(0.4, 0, 0.6, 1);
  transform-origin: center;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes vp-modal-in {
  0% {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes vp-modal-out {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-10px) scale(0.95);
    opacity: 0;
  }
}
</style>
