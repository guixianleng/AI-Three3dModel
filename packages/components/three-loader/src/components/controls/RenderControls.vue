<template>
  <div class="control-sections">
    <div class="control-section">
      <div class="section-content">
        <div class="control-item">
          <div class="control-content render-controls">
            <div class="render-option">
              <span>网格辅助线</span>
              <el-switch
                v-model="showGrid"
                @change="$emit('toggle-grid', showGrid)"
              />
            </div>
            <div class="render-option">
              <span>坐标轴辅助线</span>
              <el-switch
                v-model="showAxes"
                @change="$emit('toggle-axes', showAxes)"
              />
            </div>
            <div class="render-option">
              <span>显示地板</span>
              <el-switch
                v-model="showFloor"
                @change="$emit('toggle-floor', showFloor)"
              />
            </div>
            <div class="render-option">
              <span>地板颜色</span>
              <el-color-picker
                v-model="floorColor"
                show-alpha
                size="small"
                :predefine="predefineColors"
                @change="handleFloorColorChange"
                :disabled="!showFloor"
              />
            </div>
            <div class="render-option">
              <span>性能监控</span>
              <el-switch
                v-model="showStats"
                @change="$emit('toggle-stats', showStats)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Monitor } from '@element-plus/icons-vue'
import { ref } from 'vue'

const showGrid = ref(true)
const showAxes = ref(true)
const showStats = ref(true)
const showFloor = ref(true)
const floorColor = ref('#cccccc')

// 预设颜色
const predefineColors = ref([
  '#cccccc',  // 默认灰色
  '#ffffff',  // 白色
  '#f5f5f5',  // 浅灰色
  '#e0e0e0',  // 中灰色
  '#d3d3d3',  // 亮灰色
  '#a9a9a9'   // 深灰色
])

const emit = defineEmits<{
  (e: 'toggle-grid', show: boolean): void
  (e: 'toggle-axes', show: boolean): void
  (e: 'toggle-stats', show: boolean): void
  (e: 'toggle-floor', show: boolean): void
  (e: 'update-floor-color', color: string): void
}>()

const handleFloorColorChange = (color: string) => {
  if (showFloor.value) {
    emit('update-floor-color', color)
  }
}
</script>

<style lang="scss" scoped>
.render-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--el-fill-color);
  }

  .render-option {
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      font-size: 13px;
      color: var(--el-text-color-regular);
    }
  }
}
</style> 