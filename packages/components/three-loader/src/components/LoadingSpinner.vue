<template>
  <div class="loading-spinner">
    <div class="spinner-container">
      <div class="ant-spinner">
        <span class="ant-spin-dot">
          <i class="dot dot1"></i>
          <i class="dot dot2"></i>
          <i class="dot dot3"></i>
          <i class="dot dot4"></i>
        </span>
      </div>
      <div class="progress-text">{{ currentText }}</div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
      <div class="progress-value">{{ progress.toFixed(1) }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  texts?: string[]
  progress: number
  autoChangeText?: boolean
  textChangeInterval?: number
}>()

const defaultTexts = [
  '正在加载模型...',
  '初始化场景...',
  '准备渲染...',
  '马上就好...'
]

const currentText = ref(props.texts?.[0] || defaultTexts[0])
let textChangeTimer: number | null = null
let currentIndex = 0

// 自动切换文本
const startTextChange = () => {
  if (!props.autoChangeText) return
  
  // 先清除可能存在的定时器
  clearTextChange()
  
  textChangeTimer = window.setInterval(() => {
    const texts = props.texts || defaultTexts
    currentIndex = (currentIndex + 1) % texts.length
    currentText.value = texts[currentIndex]
    console.log('切换加载文本:', currentText.value) // 添加日志
  }, props.textChangeInterval || 2000)
}

// 清理定时器
const clearTextChange = () => {
  if (textChangeTimer) {
    clearInterval(textChangeTimer)
    textChangeTimer = null
  }
}

// 监听进度变化
watch(() => props.progress, (newProgress) => {
  // 根据进度自动选择文本
  if (newProgress < 25) {
    currentIndex = 0
  } else if (newProgress < 50) {
    currentIndex = 1
  } else if (newProgress < 75) {
    currentIndex = 2
  } else {
    currentIndex = 3
  }
  currentText.value = (props.texts || defaultTexts)[currentIndex]

  if (newProgress >= 100) {
    clearTextChange()
  }
})

// 监听自动切换文本的配置变化
watch(() => props.autoChangeText, (newValue) => {
  if (newValue) {
    startTextChange()
  } else {
    clearTextChange()
  }
})

// 监听文本切换间隔的变化
watch(() => props.textChangeInterval, () => {
  if (props.autoChangeText) {
    startTextChange() // 重新启动定时器以使用新的间隔
  }
})

onMounted(() => {
  if (props.autoChangeText) {
    startTextChange()
  }
})

onBeforeUnmount(() => {
  clearTextChange()
})
</script>

<style lang="scss" scoped>
.loading-spinner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .spinner-container {
    text-align: center;
    
    .ant-spinner {
      position: relative;
      margin: 0 auto 20px;
      width: 50px;
      height: 50px;

      .ant-spin-dot {
        position: relative;
        display: inline-block;
        width: 100%;
        height: 100%;
        transform: rotate(45deg);
        animation: antRotate 1.2s infinite linear;

        .dot {
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

          &.dot1 {
            top: 0;
            left: 0;
          }

          &.dot2 {
            top: 0;
            right: 0;
            animation-delay: 0.4s;
          }

          &.dot3 {
            right: 0;
            bottom: 0;
            animation-delay: 0.8s;
          }

          &.dot4 {
            bottom: 0;
            left: 0;
            animation-delay: 1.2s;
          }
        }
      }
    }

    .progress-text {
      font-size: 16px;
      color: var(--el-text-color-primary);
      margin-bottom: 10px;
    }

    .progress-bar {
      width: 200px;
      height: 4px;
      background: var(--el-fill-color-light);
      border-radius: 2px;
      overflow: hidden;
      margin: 0 auto 8px;

      .progress-fill {
        height: 100%;
        background: var(--el-color-primary);
        transition: width 0.3s ease;
      }
    }

    .progress-value {
      font-size: 14px;
      color: var(--el-text-color-secondary);
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

// 暗黑模式适配
:deep(html.dark) {
  .loading-spinner {
    background: rgba(0, 0, 0, 0.9);
  }
}
</style> 