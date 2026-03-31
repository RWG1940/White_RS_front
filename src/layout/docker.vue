<style scoped>
.radio-inputs {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  font-size: 14px;
  height: 3.3rem;
}

.radio-inputs .radio {
  flex: 1 1 auto;
  text-align: center;
  margin: 0 0.2rem;
}

.radio-inputs .radio input {
  display: none;
}

.radio-inputs .radio .name {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 0.7rem;
  border: none;
  padding: 0.3rem 0.8rem;
  color: rgba(51, 65, 85, 0.689);
  transition: all 0.15s ease-in-out;
  white-space: nowrap;
}

.radio-inputs .radio .icon {
  margin-bottom: 4px;
  font-size: 25px;
}

.radio-inputs .radio .name {
  font-size: 11px;
  line-height: 1.2;
}

.radio-inputs .radio input:checked + .name {
  background-color: #cbcbcb45;
  color: rgb(21, 114, 255);
}

.radio-inputs .radio:hover .name {
  box-shadow:
    inset 2px 2px 5px #d0d0d0,
    inset -2px -2px 5px #ffffff,
    0px 1px 5px #d0d0d0,
    -2px -2px 5px #ffffff;
}
</style>

<template>
  <div class="radio-inputs">
    <label class="radio" v-for="item in items" :key="item.value">
      <input
        type="radio"
        name="togglebar"
        :checked="modelValue === item.value"
        @change="() => onSelect(item.value)"
      />
      <span class="name">
        <template v-if="item.icon">
          <component :is="getIconComponent(item.icon)" class="icon" />
        </template>
        {{ item.label }}
      </span>
    </label>
  </div>
</template>

<script lang="ts" setup>
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  DesktopOutlined,
  CloudOutlined,
  BulbOutlined,
} from '@ant-design/icons-vue'

interface ToggleItem {
  label: string
  value: string
  icon?: string
}

const props = defineProps<{ modelValue: string; items: ToggleItem[] }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

// 图标映射 - 与菜单配置中的图标名称保持一致
const iconMap: Record<string, any> = {
  el: HomeOutlined,
  nl: UserOutlined,
  settingoutlined3: SettingOutlined,
  yn: DesktopOutlined,
  za: CloudOutlined,
  tl: SettingOutlined,
}

function getIconComponent(iconName: string) {
  // 如果传入的是字符串（如"HomeOutlined"），直接查找映射
  if (typeof iconName === 'string') {
    //console.log('Getting icon component:', iconName)
    return iconMap[iconName] || HomeOutlined
  }
  return iconName
}

function onSelect(value: string) {
  if (value !== props.modelValue) {
    emit('update:modelValue', value)
    emit('change', value)
  }
}
</script>
