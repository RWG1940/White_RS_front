<template>
  <div class="prompts-master">
    <div class="layout-container">
      <div class="photo-type-btns">
        <div class="photo-type-btn" :class="{ active: selectedPhotoType === 'common' }"
          @click="selectPhotoType('common')">通用</div>
        <div class="photo-type-btn" :class="{ active: selectedPhotoType === 'person' }"
          @click="selectPhotoType('person')">人像</div>
        <div class="photo-type-btn" :class="{ active: selectedPhotoType === 'product' }"
          @click="selectPhotoType('product')">产品</div>
        <div class="photo-type-btn" :class="{ active: selectedPhotoType === 'landscape' }"
          @click="selectPhotoType('landscape')">风景</div>
      </div>
      <div class="content-area">
        <Transition name="slide-in-left">
          
          <div class="common-photo" v-if="selectedPhotoType === 'common'" v-show="photoCardVisible">
            
          <h2>通用摄影</h2>
          <div class="person-photo-categories" @click="selectCategory('镜头与参数')">
            <div class="title-container">
              <CameraOutlined class="icon-rect" />
              <p class="person-photo-title">镜头与参数</p>
            </div>
            <div class="items-container">
              <div>相机品牌</div>
              <div>镜头</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('输出配置')">
            <div class="title-container">
              <ExportOutlined class="icon-rect" />
              <p class="person-photo-title">输出配置</p>
            </div>
            <div class="items-container">
              <div>分辨率</div>
              <div>尺寸</div>
              <div>比例</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
        </div>
        </Transition>

        <Transition name="slide-in-left">
          
          <div class="person-photo" v-if="selectedPhotoType === 'person'" v-show="photoCardVisible">
            
          <h2>人像摄影</h2>
          <div class="person-photo-categories" @click="selectCategory('人物主体')">
            <div class="title-container">
              <UserOutlined class="icon-rect" />
              <p class="person-photo-title">人物主体</p>
            </div>
            <div class="items-container">
              <div>头部</div>
              <div>五官</div>
              <div>发型</div>
              <div>肤色</div>
              <div>衣着</div>
              <div>身份</div>
              <div>姿态</div>
              <div>表情</div>
              <div>性格</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('构图与视角(人像)')">
            <div class="title-container">
              <EyeOutlined class="icon-rect" />
              <p class="person-photo-title">构图与视角(人像)</p>
            </div>
            <div class="items-container">
              <div>视角</div>
              <div>构图</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('光线系统')">
            <div class="title-container">
              <BulbOutlined class="icon-rect" />
              <p class="person-photo-title">光线系统</p>
            </div>
            <div class="items-container">
              <div>光源类型</div>
              <div>光质</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('色彩与风格(人像)')">
            <div class="title-container">
              <BgColorsOutlined class="icon-rect" />
              <p class="person-photo-title">色彩与风格(人像)</p>
            </div>
            <div class="items-container">
              <div>色调</div>
              <div>风格</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('场景与环境')">
            <div class="title-container">
              <EnvironmentOutlined class="icon-rect" />
              <p class="person-photo-title">场景与环境</p>
            </div>
            <div class="items-container">
              <div>场景</div>
              <div>环境</div>
              <div>天气</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('后期与氛围')">
            <div class="title-container">
              <EditOutlined class="icon-rect" />
              <p class="person-photo-title">后期与氛围</p>
            </div>
            <div class="items-container">
              <div>后期处理</div>
              <div>色彩校正</div>
              <div>氛围</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
        </div>
        </Transition>

        <Transition name="slide-in-left">
          
          <div class="product-photo" v-if="selectedPhotoType === 'product'" v-show="photoCardVisible">
            
          <h2>产品摄影</h2>
          <div class="person-photo-categories" @click="selectCategory('产品主体')">
            <div class="title-container">
              <UserOutlined class="icon-rect" />
              <p class="person-photo-title">产品主体</p>
            </div>
            <div class="items-container">
              <div>产品类型</div>
              <div>产品特征</div>
              <div>产品尺寸</div>
              <div>产品材质</div>
              <div>产品用途</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('构图与视角(产品)')">
            <div class="title-container">
              <EyeOutlined class="icon-rect" />
              <p class="person-photo-title">构图与视角(产品)</p>
            </div>
            <div class="items-container">
              <div>视角</div>
              <div>构图</div>
              <div>角度</div>
              <div>比例</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('灯光系统')">
            <div class="title-container">
              <BulbOutlined class="icon-rect" />
              <p class="person-photo-title">灯光系统</p>
            </div>
            <div class="items-container">
              <div>光源类型</div>
              <div>光质</div>
              <div>光线角度</div>
              <div>灯光布置</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('背景与场景')">
            <div class="title-container">
              <EnvironmentOutlined class="icon-rect" />
              <p class="person-photo-title">背景与场景</p>
            </div>
            <div class="items-container">
              <div>背景类型</div>
              <div>场景设置</div>
              <div>环境氛围</div>
              <div>道具搭配</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('材质与质感')">
            <div class="title-container">
              <BgColorsOutlined class="icon-rect" />
              <p class="person-photo-title">材质与质感</p>
            </div>
            <div class="items-container">
              <div>材质表现</div>
              <div>质感呈现</div>
              <div>表面处理</div>
              <div>纹理细节</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('色彩与风格(产品)')">
            <div class="title-container">
              <BgColorsOutlined class="icon-rect" />
              <p class="person-photo-title">色彩与风格(产品)</p>
            </div>
            <div class="items-container">
              <div>色调</div>
              <div>风格</div>
              <div>色彩搭配</div>
              <div>品牌调性</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('使用场景/氛围')">
            <div class="title-container">
              <EnvironmentOutlined class="icon-rect" />
              <p class="person-photo-title">使用场景/氛围</p>
            </div>
            <div class="items-container">
              <div>使用环境</div>
              <div>氛围营造</div>
              <div>情感表达</div>
              <div>目标受众</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('后期与商业风格')">
            <div class="title-container">
              <EditOutlined class="icon-rect" />
              <p class="person-photo-title">后期与商业风格</p>
            </div>
            <div class="items-container">
              <div>后期处理</div>
              <div>色彩校正</div>
              <div>商业风格</div>
              <div>品牌规范</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
        </div>
        </Transition>
        <Transition name="slide-in-left">
          
          <div class="landscape-photo" v-if="selectedPhotoType === 'landscape'" v-show="photoCardVisible">
            
          <h2>风景摄影</h2>
          <div class="person-photo-categories" @click="selectCategory('场景主体')">
            <div class="title-container">
              <UserOutlined class="icon-rect" />
              <p class="person-photo-title">场景主体</p>
            </div>
            <div class="items-container">
              <div>山景</div>
              <div>水景</div>
              <div>森林</div>
              <div>城市</div>
              <div>田园</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('地理环境')">
            <div class="title-container">
              <EnvironmentOutlined class="icon-rect" />
              <p class="person-photo-title">地理环境</p>
            </div>
            <div class="items-container">
              <div>地理位置</div>
              <div>地形地貌</div>
              <div>海拔高度</div>
              <div>气候特征</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('构图与视角(风景)')">
            <div class="title-container">
              <EyeOutlined class="icon-rect" />
              <p class="person-photo-title">构图与视角(风景)</p>
            </div>
            <div class="items-container">
              <div>视角</div>
              <div>构图</div>
              <div>景深</div>
              <div>透视</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('光线与时间')">
            <div class="title-container">
              <BulbOutlined class="icon-rect" />
              <p class="person-photo-title">光线与时间</p>
            </div>
            <div class="items-container">
              <div>黄金时刻</div>
              <div>蓝色时刻</div>
              <div>光线角度</div>
              <div>时间选择</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('天气与自然元素')">
            <div class="title-container">
              <EnvironmentOutlined class="icon-rect" />
              <p class="person-photo-title">天气与自然元素</p>
            </div>
            <div class="items-container">
              <div>天气状况</div>
              <div>云层变化</div>
              <div>自然现象</div>
              <div>环境元素</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('色彩与风格(风景)')">
            <div class="title-container">
              <BgColorsOutlined class="icon-rect" />
              <p class="person-photo-title">色彩与风格(风景)</p>
            </div>
            <div class="items-container">
              <div>色调</div>
              <div>风格</div>
              <div>色彩搭配</div>
              <div>影调</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('季节与氛围')">
            <div class="title-container">
              <EnvironmentOutlined class="icon-rect" />
              <p class="person-photo-title">季节与氛围</p>
            </div>
            <div class="items-container">
              <div>季节特征</div>
              <div>氛围营造</div>
              <div>情感表达</div>
              <div>时间感</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
          <div class="person-photo-categories" @click="selectCategory('后期与艺术风格')">
            <div class="title-container">
              <EditOutlined class="icon-rect" />
              <p class="person-photo-title">后期与艺术风格</p>
            </div>
            <div class="items-container">
              <div>后期处理</div>
              <div>色彩校正</div>
              <div>艺术风格</div>
              <div>创意表达</div>
            </div>
            <RightOutlined class="arrow-icon" />
          </div>
        </div>
        </Transition>

        <Transition name="slide-in-right">
          <div v-if="showControlCard" class="back-button" @click="handleBackToCategory">
              <LeftOutlined />返回
          </div>
        </Transition>
        <Transition name="slide-in-right">
          <PromptsControlCard v-if="showControlCard" :category="selectedCategory" />
        </Transition>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { LeftOutlined, RightOutlined, UserOutlined, EyeOutlined, CameraOutlined, BulbOutlined, EnvironmentOutlined, EditOutlined, ExportOutlined, BgColorsOutlined } from '@ant-design/icons-vue';
import PromptsControlCard from './promptsControlCard.vue';

const selectedPhotoType = ref('common');
const selectedCategory = ref('');
const showControlCard = ref(false);
const photoCardVisible = ref(true)
// 选择大类
const selectPhotoType = (type: string) => {
  selectedPhotoType.value = type;
  selectedCategory.value = '';
  showControlCard.value = false;
  photoCardVisible.value = true
};
// 选择小类 切换卡片
const selectCategory = (category: string) => {
  selectedCategory.value = category;
  selectedPhotoType.value = ''
  showControlCard.value = true;
  photoCardVisible.value = false
};

// 返回分类页面
const handleBackToCategory = () => {
  // 根据选择的分类判断返回哪个分类页面
  if (selectedCategory.value === '镜头与参数' || selectedCategory.value === '输出配置') {
    selectedPhotoType.value = 'common';
  } else if (selectedCategory.value === '产品主体' || selectedCategory.value === '构图与视角(产品)' || 
             selectedCategory.value === '镜头与拍摄参数' || selectedCategory.value === '灯光系统' ||
             selectedCategory.value === '背景与场景' || selectedCategory.value === '材质与质感' ||
             selectedCategory.value === '色彩与风格(产品)' || selectedCategory.value === '使用场景/氛围' ||
             selectedCategory.value === '后期与商业风格') {
    selectedPhotoType.value = 'product';
  } else if (selectedCategory.value === '场景主体' || selectedCategory.value === '地理环境' || 
             selectedCategory.value === '构图与视角(风景)' || selectedCategory.value === '光线与时间' ||
             selectedCategory.value === '天气与自然元素' || selectedCategory.value === '色彩与风格(风景)' ||
             selectedCategory.value === '季节与氛围' || selectedCategory.value === '后期与艺术风格') {
    selectedPhotoType.value = 'landscape';
  } else {
    selectedPhotoType.value = 'person';
  }
  selectedCategory.value = '';
  showControlCard.value = false;
  photoCardVisible.value = true;
};
</script>
<style scoped>
.prompts-master {
  height: 75vh;
  font-family: 黑体;
}

.layout-container {
  display: flex;
  height: 100%;
}

.photo-type-btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 10%;
  height: 100%;
  background-color: #e8e8e8;
  border-radius: 15px;
  padding: 10px;
  border-right: 1px solid #e9ecef;
}

.photo-type-btn {
  width: 100%;
  padding: 15px 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.photo-type-btn:hover {
  background-color: #686868;
  color: white;
}

.photo-type-btn.active {
  background-color: #000000;
  color: white;
}

.content-area {
  flex: 1;
  padding: 0 20px;
  overflow-y: auto;
  margin-left: 6px;
}

.person-photo-categories {
    cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ececec;
  padding: 15px;
  border-radius: 15px;
  margin-top: 10px;
  transition-duration: 0.2s;
}

.person-photo-categories:hover {
  background-color: #2b2b2b;
  color: white;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-rect {
  font-size: 18px;
  color: #666;
}

.person-photo-categories:hover .icon-rect {
  color: white;
}

.person-photo-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.items-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
  margin: 0 20px;
}

.items-container>div {
  background-color: #f8f9fa;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 14px;
  transition-duration: 0.3s;
}

.person-photo-categories:hover .items-container>div {
  background-color: #4a4a4a;
}

.arrow-icon {
  font-size: 18px;
  font-weight: bold;
  color: #666;
}

.person-photo-categories:hover .arrow-icon {
  color: white;
}

.back-button {
    cursor: pointer;
    font-size: 12px;
    background-color: #e8e8e8;
    border-radius: 10px;
    padding: 5px;
    width: fit-content;
    transition-duration: 0.2s;
}
.back-button:hover {
    background-color: #252525;
    color: white;
}

/* 左侧滑入动画 */
.slide-in-left-enter-active{
  transition: all 0.5s ease-in-out;
}
.slide-in-left-leave-active {
    transition: all 0.3s ease-in-out;
}

.slide-in-left-enter-from {
    opacity: 0;
    transform: translateX(-100%);
}

.slide-in-left-enter-to {
    opacity: 1;
    transform: translateX(0);
}

.slide-in-left-leave-from {
    opacity: 1;
    transform: translateX(0);
}

.slide-in-left-leave-to {
    opacity: 0;
    transform: translateX(-100%);
}

/* 右侧滑入动画 */
.slide-in-right-enter-active {
    transition: all 0.5s ease-in-out;
}
.slide-in-right-leave-active {
    transition: all 0.3s ease-in-out;
}

.slide-in-right-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.slide-in-right-enter-to {
    opacity: 1;
    transform: translateX(0);
}

.slide-in-right-leave-from {
    opacity: 1;
    transform: translateX(0);
}

.slide-in-right-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

</style>
