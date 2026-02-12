<template>
  <div class="pricing-page">
    <div class="layout-container">
      <div class="pricing-type-btns">
        <div class="pricing-type-btn" :class="{ active: selectedPricingType === 'plans' }"
          @click="selectPricingType('plans')">
          <ShopOutlined class="btn-icon" />
          <span>套餐管理</span>
        </div>
        <div class="pricing-type-btn" :class="{ active: selectedPricingType === 'userPlans' }"
          @click="selectPricingType('userPlans')">
          <UserOutlined class="btn-icon" />
          <span>用户订阅</span>
        </div>
        <div class="pricing-type-btn" :class="{ active: selectedPricingType === 'paidUsers' }"
          @click="selectPricingType('paidUsers')">
          <PayCircleOutlined  class="btn-icon" />
          <span>用户帐单</span>
        </div>
        
      </div>
      <div class="content-area">
        <Transition name="ios-pop">
          <div v-if="selectedPricingType === 'plans'" v-show="pricingCardVisible">
            <PricingPlans />
          </div>
        </Transition>
        <Transition name="ios-pop">
          <div v-if="selectedPricingType === 'userPlans'" v-show="pricingCardVisible">
            <PricingUserPlan/>
          </div>
        </Transition>
        <Transition name="ios-pop">
          <div v-if="selectedPricingType === 'paidUsers'" v-show="pricingCardVisible">
            <PricingUserBill/>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import PricingPlans from './pricingPlans.vue';
import PricingUserPlan from './pricingUserPlan.vue';
import { ShopOutlined, UserOutlined,PayCircleOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';
import PricingUserBill from './pricningBill.vue';

const selectedPricingType = ref('plans');
const pricingCardVisible = ref(true);

// 选择定价类型
const selectPricingType = (type: string) => {
  selectedPricingType.value = type;
  pricingCardVisible.value = true;
};
</script>

<style scoped>
.pricing-page {
  height: 75vh;
  font-family: 黑体;
}

.layout-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pricing-type-btns {
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
  height: 70px;
  background-color: rgba(232, 232, 232, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 15px 15px 0 0;
  padding: 10px 20px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  justify-content: center;
  align-items: center;
}

.pricing-type-btn {
  width: auto;
  min-width: 120px;
  padding: 5px 5px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.btn-icon {
  font-size: 20px;
  color: #666;
}

.pricing-type-btn:hover .btn-icon {
  color: white;
}

.pricing-type-btn.active .btn-icon {
  color: white;
}

.pricing-type-btn:hover {
  background-color: #686868;
  color: white;
}

.pricing-type-btn.active {
  background-color: #000000;
  color: white;
}

.content-area {
  flex: 1;
  padding: 0 20px 80px 20px;
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 70px;
}

.ios-pop-enter-active {
  transition:
    opacity 0.2s linear,
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.ios-pop-leave-active {
  transition:
    opacity 0.15s linear,
    transform 0.25s ease-in;
}

.ios-pop-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.ios-pop-enter-to {
  opacity: 1;
  transform: scale(1);
}

.ios-pop-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

</style>
