<template>
  <a-modal v-model:visible="visible" title="操作说明" :width="600" :footer="null" @cancel="handleCancel">
    <div class="instruction-content">
      <div class="instruction-section">
        <h3>一、系统功能概览</h3>
        <p>本系统主要包含以下功能模块：</p>
        <ul>
          <li><strong>首页</strong>：查看系统公告和反馈意见</li>
          <li><strong>辅料进度管理工作台</strong>：辅料进度相关工作的录入、查询和管理</li>
          <li><strong>云盘</strong>：在线云盘（目前是公用的）</li>
          <li><strong>系统管理</strong>：用户、权限等系统配置管理</li>
        </ul>
      </div>

      <div class="instruction-section">
        <h3>二、基本操作指南</h3>
        <h4>1. 登录系统</h4>
        <p>使用分配的账号密码登录系统，首次登录建议修改密码（点击右上角头像弹窗-个人中心-修改密码）。</p>

        <h4>2. 导航使用</h4>
        <p>左侧菜单栏为系统主要功能入口，点击相应菜单即可进入对应功能页面。</p>

        <h4>3. 数据操作</h4>
        <p>大部分页面支持以下操作：</p>
        <ul>
          <li><strong>新增</strong>：点击"新增"按钮添加数据</li>
          <li><strong>编辑</strong>：点击操作列中的"编辑"图标修改数据</li>
          <li><strong>删除</strong>：点击操作列中的"删除"图标删除数据</li>
          <li><strong>查询</strong>：使用页面顶部的查询条件筛选数据</li>
        </ul>
      </div>

      <div class="instruction-section">
        <h3>三、优鼎工作台操作指引</h3>
        <p>配件管理是系统的核心功能，包含以下子模块：</p>
        <ul>
          <li>
            <strong>导入</strong>：导入时需要填写导入批次和选择关联客户。
            导入批次的设置是为了实现以下两个功能：
            1、历史记录功能，一个批次对应了一个时期的表格，
            如果上传时填写了已有的批次，则会进行记录更新。
            2、同货号同颜色的数据添加，如果是有这种情况下的数据要补充进来，
            则可以新建一个批次去做补充，另外我们在导出功能里可以一次性导出多个批次的数据。

          </li>
          <li><strong>导出</strong>：可填写多个批次，一次性导入到一个文件里。</li>
          <li><strong>客户管理</strong>：客户和数据批次是一对多的关系，因此我们将客户和多个批次关联，这样在工作台里就能方便的切换各个客户的数据。可以在客户管理弹窗中新增客户，然后勾选，设置关联关系。</li>
          <li><strong>批次管理</strong>：批次管理的弹窗仅是删除批次，这样网页中就不会显示这些批次和数据，但是后台会备份这些删除辅料单号数据</li>
        </ul>
        <p class="hint">提示：每个配件模块都有独立的表格和操作流程，请根据实际工作需求选择对应模块。</p>
      </div>

      <div class="instruction-section">
        <h3>四、常见问题</h3>
        <h4>1. 页面无法加载</h4>
        <p>请检查网络连接，或尝试刷新页面重新登录。</p>

        <h4>2. 数据操作失败</h4>
        <p>请检查必填字段是否完整，或联系系统管理员。</p>

        <h4>3. 忘记密码</h4>
        <p>请联系系统管理员重置密码。</p>
      </div>

      <div class="instruction-section">
        <h3>五、技术支持</h3>
        <p>如遇到系统使用问题，可通过以下方式获取帮助：</p>
        <ul>
          <li>点击首页的"点我反馈意见"按钮提交问题</li>
          <li>联系系统管理员或技术支持人员</li>
          <li>查看系统更新公告了解最新功能变化</li>
        </ul>
      </div>
    </div>

    <div style="text-align: center; margin-top: 20px;">
      <a-button type="primary" @click="handleCancel">
        我知道了
      </a-button>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(false)

// 打开弹窗
const open = () => {
  visible.value = true
}

// 关闭弹窗
const handleCancel = () => {
  visible.value = false
}

// 暴露方法给父组件
defineExpose({
  open
})
</script>

<style scoped>
.instruction-content {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.instruction-section {
  margin-bottom: 20px;
}

.instruction-section h3 {
  color: #1890ff;
  margin-bottom: 8px;
  font-size: 16px;
}

.instruction-section h4 {
  color: #333;
  margin: 12px 0 6px 0;
  font-size: 14px;
}

.instruction-section p {
  margin: 6px 0;
  line-height: 1.6;
  color: #666;
}

.instruction-section ul {
  margin: 8px 0;
  padding-left: 20px;
}

.instruction-section li {
  margin: 4px 0;
  line-height: 1.5;
  color: #666;
}

.hint {
  color: #fa8c16;
  font-size: 13px;
  font-style: italic;
}

:deep(.ant-modal-body) {
  padding: 24px;
}

/* 滚动条样式 */
.instruction-content::-webkit-scrollbar {
  width: 6px;
}

.instruction-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.instruction-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.instruction-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>