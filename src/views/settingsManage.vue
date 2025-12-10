<template>
    <scroll-content>
        <template #content>
            <div>
                <a-divider>角色管理</a-divider>
                <RoleTable />
                <a-divider>文件管理</a-divider>
                <FileTable />
                <a-divider>路由管理</a-divider>
                <a-divider>角色-路由管理</a-divider>
                <a-divider>企微设置</a-divider>
                
            </div>
        </template>
    </scroll-content>
</template>
<script setup lang="ts">
import RoleTable from './settingsManage/roleTable.vue';
import ScrollContent from '@/components/scrollContent.vue';
import FileTable from './settingsManage/fileTable.vue';

</script>
<style scoped></style>