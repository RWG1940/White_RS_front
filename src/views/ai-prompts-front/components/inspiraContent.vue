<template>
  <div>
    <div class="inspiration">
      <div class="header">
        <div class="title">
          <CompassFilled />
          <span>创作灵感</span>
        </div>
        <div class="prompts-container">
          <div class="prompts-grid">
            <button class="prompt-btn"><PlusOutlined />&ensp;发布</button>
            <button class="prompt-btn"><UserOutlined />&ensp;创作中心</button>
            <button class="prompt-btn"><StarOutlined />&ensp;我的收藏</button>
          </div>
          <div class="search-box">
            <input type="text" placeholder="搜索灵感..." class="search-input" />
            <button class="search-btn"><SearchOutlined /></button>
          </div>
        </div>
        <div class="inspiration-grid">
          <InspiraCard v-for="i in 10" :key="i" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { CompassFilled, PlusOutlined, UserOutlined, StarOutlined, SearchOutlined } from '@ant-design/icons-vue'
import InspiraCard from './inspiraCard.vue';
</script>
<style scoped>
.inspiration {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.header {
  margin-bottom: 10px;
}

.title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dcdcdc;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.prompts-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.prompts-grid {
  display: flex;
  gap: 8px;
}

.prompt-btn {
  padding: 8px 12px;
  border: 1px solid #444;
  border-radius: 6px;
  background: #2a2a2a;
  color: #888;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prompt-btn:hover {
  border-color: #18d5ff;
  color: #dcdcdc;
  background: #1d4b68;
  box-shadow: 1px 1px 15px rgb(24, 143, 255);
}

.prompt-btn.active {
  background: linear-gradient(135deg, #0b4276, #0f6a56);
  border-color: #18d5ff;
  color: #fff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.prompt-btn.active:hover {
  background: linear-gradient(135deg, #0b4276, #0f6a56);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #444;
  border-radius: 6px;
  background: #2a2a2a;
  color: #dcdcdc;
  font-size: 12px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #18d5ff;
  box-shadow: 0 0 8px rgba(24, 213, 255, 0.2);
}

.search-input::placeholder {
  color: #666;
}

.search-btn {
  padding: 8px 12px;
  border: 1px solid #444;
  border-radius: 6px;
  background: #2a2a2a;
  color: #888;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn:hover {
  border-color: #18d5ff;
  color: #dcdcdc;
  background: #1d4b68;
  box-shadow: 1px 1px 15px rgb(24, 143, 255);
}

.inspiration-grid { 
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 30px;
  margin-top: 30px;
  margin-bottom: 16px;
  padding: 0 25px;

}
</style>
