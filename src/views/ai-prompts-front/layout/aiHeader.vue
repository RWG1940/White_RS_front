<template>
  <div class="ai-header">
    <div class="header-content">
      <h1 class="title">Next Prompts</h1>
      <h3 class="subtitle">让灵感有迹可循</h3>
    </div>
    <div class="button-group">
      <button
        class="custom-button"
        :class="{ active: activeButton === 'prompt' }"
        @click="setActiveButton('prompt')"
      >
        提示词大师
      </button>
      <button
        class="custom-button inactive"
        :class="{ active: activeButton === 'inspiration' }"
        @click="setActiveButton('inspiration')"
      >
        创作灵感
      </button>
      <button
        class="custom-button inactive"
        :class="{ active: activeButton === 'academy' }"
        @click="setActiveButton('academy')"
      >
        AI学院
      </button>
      <button
        class="custom-button inactive"
        :class="{ active: activeButton === 'pricing' }"
        @click="setActiveButton('pricing')"
      >
        定价
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  activeButton: string
}>()

const emit = defineEmits<{
  change: [button: string]
}>()

const setActiveButton = (button: string) => {
  emit('change', button)
}
</script>
<style scoped>
.ai-header {
  color: #fff;
  background-color: #222222;
  border-bottom: 1px solid #333333;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
}

.button-group {
  display: flex;
  gap: 12px;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  font-size: 29px;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(90deg, #3498db, #2ae7c1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 14px;
  font-weight: normal;
  margin: 0;
  color: #ccc;
}

.custom-button {
  position: relative;
  background: #0f172a;
  height: 64px;
  width: 160px;
  border: 2px solid #4b5563;
  text-align: left;
  padding: 12px;
  color: #9ca3af;
  font-size: 14px;
  font-weight: bold;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.5s ease;
  cursor: pointer;
  transform: scale(1);
}

.custom-button.inactive {
  border-color: #4b5563;
  color: #9ca3af;
}

.custom-button.active {
  border-color: #0d9488;
  color: #ffffff;
  background: #0f172a;
}

.custom-button:hover {
  color: #6ee7b7;
}

.custom-button.active:hover {
  border-color: #34d399;
  color: #6ee7b7;
}

.custom-button::before {
  content: '';
  position: absolute;
  width: 30px;
  height: 30px;
  right: 6px;
  top: 6px;
  z-index: 10;
  background: #6366f1;
  border-radius: 50%;
  filter: blur(8px);
  transition: all 0.5s ease;
  opacity: 0;
}

.custom-button::after {
  content: '';
  position: absolute;
  z-index: 10;
  width: 50px;
  height: 50px;
  background: #2dd4bf;
  right: 18px;
  top: 12px;
  border-radius: 50%;
  filter: blur(8px);
  transition: all 0.5s ease;
  opacity: 0;
}

.custom-button.active::before,
.custom-button.active::after {
  opacity: 1;
}

.custom-button:hover::before {
  right: 30px;
  bottom: -12px;
  filter: blur(6px);
  opacity: 1;
}

.custom-button:hover::after {
  right: -18px;
  transform: scale(1.1);
  opacity: 1;
}

.custom-button.active:hover::before {
  right: 30px;
  bottom: -12px;
  filter: blur(6px);
}

.custom-button.active:hover::after {
  right: -18px;
  transform: scale(1.1);
}
</style>
