<template>
  <div class="control-sections">
    <div class="control-section">
      <div class="section-header">
        <el-icon><Monitor /></el-icon>
        <span>渲染设置</span>
      </div>
      <div class="section-content">
        <div class="control-item">
          <div class="control-content render-controls">
            <div class="render-option">
              <span>参考网格</span>
              <el-switch
                v-model="showGrid"
                @change="$emit('toggle-grid', showGrid)"
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
const showStats = ref(true)

defineEmits<{
  (e: 'toggle-grid', show: boolean): void
  (e: 'toggle-stats', show: boolean): void
}>()
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