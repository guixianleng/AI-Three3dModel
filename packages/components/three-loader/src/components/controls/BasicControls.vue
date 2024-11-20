<template>
  <div class="control-sections">
    <!-- 缩放控制 -->
    <div class="control-section">
      <div class="section-header">
        <el-icon><ZoomIn /></el-icon>
        <span>模型缩放</span>
      </div>
      <div class="control-content">
        <div class="control-row">
          <el-slider
            v-model="localScale"
            :min="0.1"
            :max="2"
            :step="0.1"
            style="width: 100%"
            @change="handleScaleChange"
          />
        </div>
      </div>
    </div>

    <!-- 动画控制 -->
    <div class="control-section">
      <div class="section-header">
        <el-icon><VideoPlay /></el-icon>
        <span>动画控制</span>
      </div>
      <div class="control-content">
        <div class="control-row">
          <el-button-group>
            <el-button
              :type="isPlaying ? 'primary' : ''"
              @click="sceneEvents?.startAnimation()"
              :disabled="isPlaying"
              title="播放动画"
            >
              <el-icon><VideoPlay /></el-icon>
            </el-button>
            <el-button
              :type="!isPlaying ? 'primary' : ''"
              @click="sceneEvents?.pauseAnimation()"
              :disabled="!isPlaying"
              title="暂停动画"
            >
              <el-icon><VideoPause /></el-icon>
            </el-button>
            <el-button 
              @click="sceneEvents?.resetAnimation()"
              title="重置动画"
            >
              <el-icon><RefreshRight /></el-icon>
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, inject } from 'vue'
import { ZoomIn, VideoPlay, VideoPause, RefreshRight } from '@element-plus/icons-vue'
import type { SceneEvents } from '../../config/eventKeys'
import { SCENE_EVENTS_KEY } from '../../config/eventKeys'

const props = defineProps<{
  scale: number
  isPlaying: boolean
}>()

// 注入场景事件
const sceneEvents = inject<SceneEvents>(SCENE_EVENTS_KEY)

// 本地缩放值
const localScale = ref(props.scale)

// 监听 props 变化
watch(() => props.scale, (newScale) => {
  localScale.value = newScale
})

// 处理缩放变化
const handleScaleChange = (value: number) => {
  sceneEvents?.scaleChange(value)
}
</script>

<style lang="scss" scoped>
.control-sections {
  .control-section {
    background: var(--el-fill-color-light);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

    &:last-child {
      margin-bottom: 0;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      font-weight: bold;
      font-size: 14px;
      color: var(--el-text-color-primary);
    }

    .control-content {
      .control-row {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;

        .el-button-group {
          .el-button {
            padding: 8px 16px;

            .el-icon {
              margin-right: 0;
            }

            &:hover {
              background-color: var(--el-color-primary-light-7);
              color: var(--el-color-primary);
            }

            &.is-disabled {
              &:hover {
                background-color: var(--el-button-disabled-bg-color);
                color: var(--el-button-disabled-text-color);
              }
            }
          }
        }
      }
    }
  }
}

// 调整滑块样式
:deep(.el-slider) {
  --el-slider-button-size: 16px;
  --el-slider-height: 4px;
}
</style> 