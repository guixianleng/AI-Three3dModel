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
              @click="$emit('start-animation')"
              :disabled="isPlaying"
            >
              <el-icon><VideoPlay /></el-icon>
              播放
            </el-button>
            <el-button
              :type="!isPlaying ? 'primary' : ''"
              @click="$emit('pause-animation')"
              :disabled="!isPlaying"
            >
              <el-icon><VideoPause /></el-icon>
              暂停
            </el-button>
            <el-button @click="$emit('reset-animation')">
              <el-icon><RefreshRight /></el-icon>
              重置
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ZoomIn, VideoPlay, VideoPause, RefreshRight } from '@element-plus/icons-vue'

const props = defineProps<{
  scale: number
  isPlaying: boolean
}>()

const emit = defineEmits<{
  (e: 'scale-change', value: number): void
  (e: 'start-animation'): void
  (e: 'pause-animation'): void
  (e: 'reset-animation'): void
}>()

// 本地缩放值
const localScale = ref(props.scale)

// 监听 props 变化
watch(() => props.scale, (newScale) => {
  localScale.value = newScale
})

// 处理缩放变化
const handleScaleChange = (value: number) => {
  emit('scale-change', value)
}
</script>

<style lang="scss" scoped>
.control-sections {
  .control-section {
    background: var(--el-fill-color-light);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;

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
      }
    }
  }
}
</style> 