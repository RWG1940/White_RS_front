<template>
    <div v-if="isMobile" class="work-wrap-1">
        <div class="search-card">
            <a-collapse v-model:activeKey="activeKey">
                <a-collapse-panel key="1" header="查找辅料">
                    <a-row>
                        <a-select v-model:value="value" mode="tags" style="width: 100%" placeholder="选择批次"
                            :options="options" @change="handleChange"></a-select>
                        <a-select v-model:value="value" mode="tags" style="width: 100%" placeholder="选择工厂"
                            :options="options" @change="handleChange"></a-select>
                    </a-row>
                    <a-row style="margin-top: 10px;">
                        <a-input-search v-model:value="value" placeholder="输入合同号" enter-button @search="onSearch" />
                    </a-row>
                </a-collapse-panel>
            </a-collapse>
        </div>
        <div class="process-card">
            <a-card title="辅料名">
                <template #extra>
                    <a-button type="primary" @click="showDrawer">详情</a-button>
                </template>
                <a-row style="display:flex;align-items: center;justify-content: left;">
                    <a-col> 生产进度：</a-col>
                    <a-col style="color: red;">辅料工厂确认合同</a-col>
                </a-row>
                <a-row style="display:flex;align-items: center;justify-content: left;">
                    <a-col> 备注：</a-col>
                    <a-col>12345</a-col>
                </a-row>
                <a-row style="display:flex;align-items: center;justify-content: center;">
                    <a-col> 优先级：</a-col>
                    <a-col>
                        <FiveStars />
                    </a-col>
                </a-row>

                <div style="display: flex;align-items: center;justify-content: center;">
                    <process-radio-card />
                </div>
                
                <a-row style="margin-top: 60px;justify-content: center;">
                    <a-textarea style="margin-bottom: 10px;" v-model:value="value" placeholder="填写备注" :rows="3" />
                    <AcceptButton />
                </a-row>
            </a-card>
        </div>

        <a-drawer title="辅料详情" :size="size" :placement="placement" :open="openInfo" @close="showDrawer">


        </a-drawer>
 
    </div>
    <div v-else class="work-wrap-2"> 
      <ASTable />
    </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import processRadioCard from './components/processRadioCard.vue';
import AcceptButton from './components/acceptButton.vue';
import type { DrawerProps } from 'ant-design-vue';
import FiveStars from './components/fiveStars.vue';
import YDTable from './components/YDTable.vue';
import ASTable from './components/ASTable.vue';

const placement = ref<DrawerProps['placement']>('top');
const openInfo = ref<boolean>(false);
const size = ref<'default' | 'large' | number>('large');

const showDrawer = () => {
    openInfo.value = !openInfo.value;
};

const activeKey = ref(['1']);

// 表单与控件状态
const value = ref('')
const options = ref([{ label: '工厂A', value: 1 }, { label: '工厂B', value: 2 }])

const handleChange = (val: any) => {
    // select 的值通常为字符串或数组，直接写回 value
    value.value = val
}

const onSearch = (val: string) => {
    // 简单占位搜索处理
    console.log('搜索关键词:', val)
}

// 响应式判断是否为移动端（宽度 <= 768px）
const isMobile = ref(false)

const updateIsMobile = () => {
    isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
    updateIsMobile()
    window.addEventListener('resize', updateIsMobile)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateIsMobile)
})
</script>
<style scoped>
.header {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.search-card {
    width: 100%;
    margin-bottom: 10px;

}

.process-card {
    width: 100%;
}

/* 使最外层工作区域可滚动，当内容超出时显示滚动条 */
.work-wrap-1 {
    /* 根据页面布局调整高度，这里使用视口高度减去顶部等间距，保证在多数页面中可滚动 */
    max-height: calc(100vh - 150px);
    overflow: auto;
}


</style>