<template>
  <el-card class="control-card">
    <template #header>
      <div class="panel-header">
        <span class="title">模型控制</span>
        <el-tag size="small" type="info">FBX模型</el-tag>
      </div>
    </template>
    
    <div class="control-sections">
      <!-- 缩放控制 -->
      <div class="control-section">
        <div class="section-header">
          <el-icon><ZoomIn /></el-icon>
          <span>缩放控制</span>
        </div>
        <div class="section-content">
          <el-slider 
            v-model="modelControls.scale" 
            :min="0.1" 
            :max="2" 
            :step="0.1"
            :format-tooltip="value => `${value}x`"
            @change="handleScaleChange"
          />
        </div>
      </div>
      
      <!-- 动画控制 -->
      <div class="control-section">
        <div class="section-header">
          <el-icon><VideoPlay /></el-icon>
          <span>动画控制</span>
        </div>
        <div class="section-content animation-controls">
          <el-button-group>
            <el-tooltip content="开始动画" placement="top">
              <el-button 
                :type="modelControls.isPlaying ? '' : 'primary'"
                :icon="CaretRight"
                @click="handleStartAnimation"
                :disabled="modelControls.isPlaying"
              />
            </el-tooltip>
            <el-tooltip content="暂停动画" placement="top">
              <el-button 
                :type="!modelControls.isPlaying ? '' : 'warning'"
                :icon="VideoPause"
                @click="handlePauseAnimation"
                :disabled="!modelControls.isPlaying"
              />
            </el-tooltip>
            <el-tooltip content="重置动画" placement="top">
              <el-button 
                type="info"
                :icon="RefreshLeft"
                @click="handleResetAnimation"
              />
            </el-tooltip>
          </el-button-group>
        </div>
      </div>
      
      <!-- 渲染模式 -->
      <div class="control-section">
        <div class="section-header">
          <el-icon><Monitor /></el-icon>
          <span>渲染模式</span>
        </div>
        <div class="section-content render-controls">
          <div class="render-option">
            <span>线框模式</span>
            <el-switch
              v-model="modelControls.wireframe"
              active-text="线框"
              inactive-text="实体"
            />
          </div>
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
    
    <el-divider>视图操作</el-divider>
    
    <div class="view-controls">
      <el-tooltip content="重置相机视角" placement="top">
        <el-button type="primary" :icon="View" @click="$emit('reset-camera')">
          重置视角
        </el-button>
      </el-tooltip>
      <el-tooltip content="保存场景截图" placement="top">
        <el-button :icon="Camera" @click="$emit('take-screenshot')">
          场景截图
        </el-button>
      </el-tooltip>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { 
  CaretRight, 
  VideoPause, 
  RefreshLeft,
  ZoomIn,
  VideoPlay,
  Monitor,
  View,
  Camera
} from '@element-plus/icons-vue'
import type { IModelControls } from '../types'
import { ref } from 'vue'
import 'element-plus/es/components/card/style/css'

defineProps({
  modelControls: {
    type: Object as () => IModelControls,
    required: true
  }
})

const emit = defineEmits([
  'reset-camera', 
  'take-screenshot', 
  'start-animation', 
  'pause-animation', 
  'reset-animation',
  'toggle-grid',
  'toggle-stats',
  'scale-change'
])

const showGrid = ref(true)
const showStats = ref(true)

const handleStartAnimation = () => {
  emit('start-animation')
}

const handlePauseAnimation = () => {
  emit('pause-animation')
}

const handleResetAnimation = () => {
  emit('reset-animation')
}

const handleScaleChange = (value: number) => {
  emit('scale-change', value)
}
</script>

<style lang="scss" scoped>
.control-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
  
  .control-sections {
    .control-section {
      margin-bottom: 20px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        color: var(--el-text-color-regular);
        
        .el-icon {
          font-size: 18px;
        }
        
        span {
          font-size: 14px;
          font-weight: 500;
        }
      }
      
      .section-content {
        padding: 0 4px;
        
        &.animation-controls {
          display: flex;
          justify-content: center;
          
          .el-button {
            padding: 8px 16px;
            
            .el-icon {
              margin: 0;
            }
          }
        }
        
        &.render-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
          
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
      }
    }
  }
  
  .el-divider {
    margin: 24px 0;
    
    :deep(.el-divider__text) {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }
  
  .view-controls {
    display: flex;
    justify-content: center;
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
  .control-card {
    background: rgba(0, 0, 0, 0.8);
  }
}
</style> 