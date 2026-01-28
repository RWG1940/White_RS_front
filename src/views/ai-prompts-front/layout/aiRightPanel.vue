<template>
    <div class="ai-right-panel">
        <div class="panel-header">
            <h3>
                <SettingOutlined />&ensp;控制中心
            </h3>
            <a-button type="primary" class="login-btn">
                <template #icon>
                    <UserOutlined />
                </template>
                登录
            </a-button>
        </div>
        <div class="panel-content">
            <RightPanelPromptsPreview />
        </div>
        <div class="weight-content">
            <p class="weight-header">权重调整</p>
            <div class="weight-list">
                <div class="weight-card" v-for="(item, index) in weightItems" :key="index">
                    <div class="card-content">
                        <div class="weight-info">
                            <span class="weight-title">{{ item.title }}</span>
                            <span class="weight-desc">{{ item.description }}</span>
                        </div>
                        <div class="weight-control">
                            <a-input-number v-model:value="item.value" :min="0" :max="100" :step="1" size="small"
                                class="weight-input" />
                        </div>
                        <div class="weight-close">
                            <CloseCircleOutlined />
                        </div>

                    </div>
                </div>
            </div>
        </div>



        <div style="display: flex; justify-content: center">
            <GenerateButton />
        </div>
    </div>
</template>
<script setup lang="ts">
import { UserOutlined, CloseCircleOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { ref } from 'vue'
import RightPanelPromptsPreview from '../components/rightPanelPromptsPreview.vue'
import GenerateButton from '../components/generateButton.vue'

interface WeightItem {
    title: string
    description: string
    value: number
}

const weightItems = ref<WeightItem[]>([
    {
        title: '创意权重',
        description: '控制生成内容的创新程度',
        value: 75
    },
    {
        title: '准确性权重',
        description: '确保生成内容的准确性和可靠性',
        value: 85
    },
    {
        title: '多样性权重',
        description: '影响生成内容的多样性',
        value: 60
    },
    {
        title: '相关性权重',
        description: '保持生成内容与输入的相关性',
        value: 90
    },
    {
        title: '流畅性权重',
        description: '控制生成内容的语言流畅度',
        value: 80
    }
])
</script>
<style scoped>
.ai-right-panel {
    height: 100%;
    color: #fff;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #333;
}

.panel-content {
    padding: 12px;
}

h3 {
    color: #fff;
    margin: 0;
    font-size: 18px;
}

.login-btn {
    background: linear-gradient(90deg, #222222, #111111);
    font-weight: lighter;
    border: none;
    border-radius: 6px;
    height: 32px;
    font-weight: bold;
    transition: all 0.3s ease;
    color: #c3c3c3;
}

.login-btn:hover {
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

p {
    color: #ccc;
    line-height: 1.6;
}

.prompts-title {
    font-weight: lighter;
    margin-bottom: 5px;
}

.weight-content {
    margin: 12px;
    margin-top: 0;
    padding: 10px;
    border-radius: 10px;
    border: solid 1px #555555;
    background-color: #222222;
    height: 220px;
    display: flex;
    flex-direction: column;
}

.weight-header {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #bdbdbd;
}

.weight-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
}

.weight-list::-webkit-scrollbar {
    width: 6px;
}

.weight-list::-webkit-scrollbar-track {
    background: #333;
    border-radius: 3px;
}

.weight-list::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 3px;
}

.weight-list::-webkit-scrollbar-thumb:hover {
    background: #666;
}

.weight-card {
    border-radius: 8px;
    border: solid 1px #555555;
    height: 60px;
    margin-bottom: 8px;
    background-color: #2f2f2f;
    padding: 8px 12px;
}

.card-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
}

.weight-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
}

.weight-title {
    font-size: 12px;
    color: #d6d6d6;
    margin-bottom: 2px;
}

.weight-desc {
    font-size: 11px;
    color: #aaa;
}

.weight-control {
    display: flex;
    align-items: center;
}

.weight-input {
    width: 70px;
}

.weight-input :deep(.ant-input-number-input) {
    color: #fff;
    background-color: #444;
    border: 1px solid #666;
}

.weight-input :deep(.ant-input-number-handler-wrap) {
    border-left: 1px solid #666;
}

.weight-close{
    color: rgb(126, 126, 126);
    cursor: pointer;
    margin-left: 5px;
}
.weight-close:hover{
    color: rgb(254, 90, 90);
    cursor: pointer;
    margin-left: 5px;
}
</style>
