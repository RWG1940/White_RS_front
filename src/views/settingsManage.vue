<template>
    <scroll-content>
        <template #content>
            <div>
                <a-collapse accordion>
                    <a-collapse-panel key="1" header="角色管理">
                        <RoleTable />
                    </a-collapse-panel>
                    <a-collapse-panel key="2" header="文件管理">
                        <FileTable />
                    </a-collapse-panel>
                    <a-collapse-panel key="3" header="企微webhook设置">
                        <WebhookTable />
                    </a-collapse-panel>
                    <a-collapse-panel key="4" header="企微webhook-数据批次关联设置">
                        <WebhookTableImport />
                    </a-collapse-panel>
                </a-collapse>
            </div>
        </template>
    </scroll-content>
</template>
<script setup lang="ts">
import RoleTable from './settingsManage/roleTable.vue';
import ScrollContent from '@/components/scrollContent.vue';
import FileTable from './settingsManage/fileTable.vue';
import  WebhookTable from './settingsManage/webhookTable.vue';
import WebhookTableImport from './settingsManage/webhookTableImportTable.vue';

</script>
<style scoped></style>