<style scoped>
.card {
  /* color used to softly clip top and bottom of the .words container */

  background-color: var(--bg-color);
  padding: 1rem 2rem;
  border-radius: 1.25rem;
  height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.loader {
  color: rgb(124, 124, 124);
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 15px;
  -webkit-box-sizing: content-box;
  box-sizing: content-box;
  height: 40px;
  padding: 10px 10px;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  border-radius: 8px;
}

.words {
  overflow: hidden;
  position: relative;
}
.words::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    var(--bg-color) 10%,
    transparent 30%,
    transparent 70%,
    var(--bg-color) 90%
  );
  z-index: 20;
}

.word {
  display: block;
  height: 100%;
  padding-left: 6px;
  color: #6a90fa;
  animation: spin_4991 3s infinite;
}
.spinner {
  font-size: 28px;
  position: relative;
  display: inline-block;
  width: 1em;
  height: 1em;
}

.spinner.center {
  position: relative;
  margin-bottom: 1rem;
}

.spinner .spinner-blade {
  position: absolute;
  left: 0.4629em;
  bottom: 0;
  width: 0.074em;
  height: 0.2777em;
  border-radius: 0.0555em;
  background-color: transparent;
  -webkit-transform-origin: center -0.2222em;
  -ms-transform-origin: center -0.2222em;
  transform-origin: center -0.2222em;
  animation: spinner-fade9234 1s infinite linear;
}

.spinner .spinner-blade:nth-child(1) {
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
  -webkit-transform: rotate(0deg);
  -ms-transform: rotate(0deg);
  transform: rotate(0deg);
}

.spinner .spinner-blade:nth-child(2) {
  -webkit-animation-delay: 0.083s;
  animation-delay: 0.083s;
  -webkit-transform: rotate(30deg);
  -ms-transform: rotate(30deg);
  transform: rotate(30deg);
}

.spinner .spinner-blade:nth-child(3) {
  -webkit-animation-delay: 0.166s;
  animation-delay: 0.166s;
  -webkit-transform: rotate(60deg);
  -ms-transform: rotate(60deg);
  transform: rotate(60deg);
}

.spinner .spinner-blade:nth-child(4) {
  -webkit-animation-delay: 0.249s;
  animation-delay: 0.249s;
  -webkit-transform: rotate(90deg);
  -ms-transform: rotate(90deg);
  transform: rotate(90deg);
}

.spinner .spinner-blade:nth-child(5) {
  -webkit-animation-delay: 0.332s;
  animation-delay: 0.332s;
  -webkit-transform: rotate(120deg);
  -ms-transform: rotate(120deg);
  transform: rotate(120deg);
}

.spinner .spinner-blade:nth-child(6) {
  -webkit-animation-delay: 0.415s;
  animation-delay: 0.415s;
  -webkit-transform: rotate(150deg);
  -ms-transform: rotate(150deg);
  transform: rotate(150deg);
}

.spinner .spinner-blade:nth-child(7) {
  -webkit-animation-delay: 0.498s;
  animation-delay: 0.498s;
  -webkit-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  transform: rotate(180deg);
}

.spinner .spinner-blade:nth-child(8) {
  -webkit-animation-delay: 0.581s;
  animation-delay: 0.581s;
  -webkit-transform: rotate(210deg);
  -ms-transform: rotate(210deg);
  transform: rotate(210deg);
}

.spinner .spinner-blade:nth-child(9) {
  -webkit-animation-delay: 0.664s;
  animation-delay: 0.664s;
  -webkit-transform: rotate(240deg);
  -ms-transform: rotate(240deg);
  transform: rotate(240deg);
}

.spinner .spinner-blade:nth-child(10) {
  -webkit-animation-delay: 0.747s;
  animation-delay: 0.747s;
  -webkit-transform: rotate(270deg);
  -ms-transform: rotate(270deg);
  transform: rotate(270deg);
}

.spinner .spinner-blade:nth-child(11) {
  -webkit-animation-delay: 0.83s;
  animation-delay: 0.83s;
  -webkit-transform: rotate(300deg);
  -ms-transform: rotate(300deg);
  transform: rotate(300deg);
}

.spinner .spinner-blade:nth-child(12) {
  -webkit-animation-delay: 0.913s;
  animation-delay: 0.913s;
  -webkit-transform: rotate(330deg);
  -ms-transform: rotate(330deg);
  transform: rotate(330deg);
}

@keyframes spinner-fade9234 {
  0% {
    background-color: #69717d;
  }

  100% {
    background-color: transparent;
  }
}
@keyframes spin_4991 {
  10% {
    -webkit-transform: translateY(-102%);
    transform: translateY(-102%);
  }

  25% {
    -webkit-transform: translateY(-100%);
    transform: translateY(-100%);
  }

  35% {
    -webkit-transform: translateY(-202%);
    transform: translateY(-202%);
  }

  50% {
    -webkit-transform: translateY(-200%);
    transform: translateY(-200%);
  }

  60% {
    -webkit-transform: translateY(-302%);
    transform: translateY(-302%);
  }

  75% {
    -webkit-transform: translateY(-300%);
    transform: translateY(-300%);
  }

  85% {
    -webkit-transform: translateY(-402%);
    transform: translateY(-402%);
  }

  100% {
    -webkit-transform: translateY(-400%);
    transform: translateY(-400%);
  }
}
</style>

<template>
  <div class="card">
    <div class="spinner center">
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
    </div>
    <div class="loader">
      <p>正在加载</p>
      <div class="words">
        <span class="word">权限数据</span>
        <span class="word">批次数据</span>
        <span class="word">关联数据</span>
        <span class="word">图片文字渲染</span>
        <span class="word">完成</span>
      </div>
    </div>
  </div>
</template>
