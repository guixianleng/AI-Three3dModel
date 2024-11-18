<template>
  <div class="loading-container">
    <div class="loading-content">
      <!-- Ant Design 风格的加载动画 -->
      <div class="ant-spin">
        <span class="ant-spin-dot">
          <i class="ant-spin-dot-item"></i>
          <i class="ant-spin-dot-item"></i>
          <i class="ant-spin-dot-item"></i>
          <i class="ant-spin-dot-item"></i>
        </span>
        <div class="ant-spin-text" v-if="showText">
          <span class="text">{{ currentText }}</span>
          <div class="progress-value" v-if="showProgress">{{ Math.floor(progress) }}%</div>
        </div>
      </div>
      
      <!-- 进度条 -->
      <div class="progress-bar" v-if="showProgress">
        <div class="progress" :style="{ width: `${progress}%` }">
          <div class="glow"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: '加载中...'
  },
  texts: {
    type: Array<string>,
    default: () => [
      '正在加载...',
      '初始化中...',
      '马上就好...',
      '请稍候...'
    ]
  },
  progress: {
    type: Number,
    default: 0
  },
  showProgress: {
    type: Boolean,
    default: true
  },
  showText: {
    type: Boolean,
    default: true
  },
  autoChangeText: {
    type: Boolean,
    default: true
  },
  textChangeInterval: {
    type: Number,
    default: 2000
  }
})

let textIndex = 0
const currentText = ref(props.text)
let textChangeTimer: number | undefined

// 更新加载文本
const updateLoadingText = () => {
  textIndex = (textIndex + 1) % props.texts.length
  currentText.value = props.texts[textIndex]
}

// 监听 text prop 的变化
watch(() => props.text, (newText) => {
  currentText.value = newText
})

onMounted(() => {
  if (props.autoChangeText) {
    textChangeTimer = window.setInterval(updateLoadingText, props.textChangeInterval)
  }
})

onBeforeUnmount(() => {
  if (textChangeTimer) {
    clearInterval(textChangeTimer)
  }
})
</script>

<style lang="scss" scoped>
.loading-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;

  .loading-content {
    text-align: center;

    .ant-spin {
      position: relative;
      display: inline-block;
      margin-bottom: 40px;

      .ant-spin-dot {
        position: relative;
        display: inline-block;
        width: 48px;
        height: 48px;
        transform: rotate(45deg);
        animation: antRotate 1.2s infinite linear;

        .ant-spin-dot-item {
          position: absolute;
          display: block;
          width: 20px;
          height: 20px;
          background-color: var(--el-color-primary);
          border-radius: 100%;
          transform: scale(0.75);
          transform-origin: 50% 50%;
          opacity: 0.3;
          animation: antSpinMove 1s infinite linear alternate;

          &:nth-child(1) {
            top: 0;
            left: 0;
            animation-delay: 0s;
          }

          &:nth-child(2) {
            top: 0;
            right: 0;
            animation-delay: 0.4s;
          }

          &:nth-child(3) {
            right: 0;
            bottom: 0;
            animation-delay: 0.8s;
          }

          &:nth-child(4) {
            bottom: 0;
            left: 0;
            animation-delay: 1.2s;
          }
        }
      }

      .ant-spin-text {
        margin-top: 24px;
        color: #fff;
        font-size: 16px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

        .text {
          display: inline-block;
          min-width: 120px;
          animation: fadeIn 0.5s ease;
        }

        .progress-value {
          margin-top: 8px;
          font-size: 14px;
          color: var(--el-color-primary);
        }
      }
    }

    .progress-bar {
      width: 300px;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;

      .progress {
        height: 100%;
        background: var(--el-color-primary);
        border-radius: 2px;
        position: relative;
        transition: width 0.3s ease;

        .glow {
          position: absolute;
          top: 0;
          right: 0;
          width: 20px;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8));
          animation: glowMove 1.5s ease-in-out infinite;
        }
      }
    }
  }
}

@keyframes antRotate {
  to {
    transform: rotate(405deg);
  }
}

@keyframes antSpinMove {
  to {
    opacity: 1;
  }
}

@keyframes glowMove {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(500%);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 