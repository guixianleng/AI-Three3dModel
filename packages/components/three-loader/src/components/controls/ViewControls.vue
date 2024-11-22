<template>
  <div class="view-controls-wrapper">
    <el-divider>视图操作</el-divider>
    <div class="view-controls">
      <el-tooltip content="重置相机视角" placement="top">
        <el-button type="primary" :icon="View" @click="$emit('reset-camera')"> 重置视角 </el-button>
      </el-tooltip>
      <el-tooltip content="保存场景截图" placement="top">
        <el-button :icon="Camera" @click="$emit('take-screenshot')"> 场景截图 </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { View, Camera } from '@element-plus/icons-vue'

defineEmits<{
  (e: 'reset-camera'): void
  (e: 'take-screenshot'): void
}>()
</script>

<style lang="scss" scoped>
.view-controls-wrapper {
  position: sticky;
  bottom: 0;
  background: inherit;
  padding: 16px 0;
  margin-top: auto;
  border-top: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    height: 20px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9));
    pointer-events: none;
  }

  .el-divider {
    margin: 0 0 16px 0;

    :deep(.el-divider__text) {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }

  .view-controls {
    display: flex;
    gap: 12px;

    .el-button {
      flex: 1;
      justify-content: center;

      .el-icon {
        margin-right: 4px;
      }
    }
  }
}

// 暗黑模式适配
:deep(html.dark) {
  .view-controls-wrapper::before {
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8));
  }
}
</style>
