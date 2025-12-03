<template>
    <div class="work-wrap">
        <div class="search-card">
            <a-collapse v-model:activeKey="activeKey">
                <a-collapse-panel key="1" header="查找辅料">

                    <a-row style="margin-top: 10px;">
                        <a-input-search v-model:value="value" placeholder="输入单号或合同号" enter-button @search="onSearch" />
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
                    <a-col> 优先级：</a-col>
                    <a-col>
                        <FiveStars />
                    </a-col>
                </a-row>
                <a-row style="display:flex;align-items: center;justify-content: left;">
                    <a-col> 生产进度：</a-col>
                    <a-col style="color: red;">辅料工厂确认合同</a-col>
                </a-row>
                <a-row style="display:flex;align-items: center;justify-content: left;">
                    <a-col> 备注：</a-col>
                    <a-col>12345</a-col>
                </a-row>
                <div style="display: flex;align-items: center;justify-content: center;margin-top: 10px;">
                    <a-progress type="circle" :stroke-color="{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                    }" :percent="20" />
                </div>

            </a-card>
        </div>

        <a-drawer title="辅料详情" :size="size" :placement="placement" :open="openInfo" @close="showDrawer">


        </a-drawer>

    </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import FiveStars from './components/fiveStars.vue';


import type { DrawerProps } from 'ant-design-vue';
const placement = ref<DrawerProps['placement']>('top');
const openInfo = ref<boolean>(false);
const openTable = ref<boolean>(false);
const openImport = ref<boolean>(false);
const size = ref<'default' | 'large' | number>('large');

const showDrawer = () => {
    openInfo.value = !openInfo.value;
};

const activeKey = ref(['1']);


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
.work-wrap {
    /* 根据页面布局调整高度，这里使用视口高度减去顶部等间距，保证在多数页面中可滚动 */
    max-height: calc(100vh - 150px);
    overflow: auto;
}

/* 移动端适配：屏宽较小时将 .work-wrap 宽度设置为原来的一半并居中 */
@media (width > 768px) {
    .work-wrap {
        width: 50%;
        max-height: calc(100vh - 150px);
    }
}

@media (width > 1000px) {
    .work-wrap {
        width: 30%;
        max-height: calc(100vh - 150px);
    }
}
</style>