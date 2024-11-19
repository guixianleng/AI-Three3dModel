<template>
  <el-card class="control-card">
    <template #header>
      <div class="panel-header">
        <span class="title">模型控制</span>
        <el-tag size="small" type="info">FBX模型</el-tag>
      </div>
    </template>
    
    <div class="control-content">
      <!-- 控制模块切换 -->
      <div class="module-selector">
        <el-radio-group v-model="activeModule" size="small">
          <el-radio-button label="basic">
            <el-icon><Tools /></el-icon>
            基础
          </el-radio-button>
          <el-radio-button label="render">
            <el-icon><Monitor /></el-icon>
            渲染
          </el-radio-button>
          <el-radio-button label="lights">
            <el-icon><Sunny /></el-icon>
            光源
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 控制模块内容 -->
      <div class="module-content">
        <!-- 基础控制模块 -->
        <div v-show="activeModule === 'basic'" class="control-sections">
          <!-- 缩放控制 -->
          <div class="control-section">
            <div class="section-header">
              <el-icon><ZoomIn /></el-icon>
              <span>缩放控制</span>
            </div>
            <div class="section-content scale-control">
              <span>缩放比例</span>
              <el-input-number
                v-model="modelControls.scale"
                :min="0.1"
                :max="2"
                :step="0.1"
                :precision="1"
                size="small"
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
        </div>

        <!-- 渲染设置模块 -->
        <div v-show="activeModule === 'render'" class="control-sections">
          <div class="control-section">
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

        <!-- 光源设置模块 -->
        <div v-show="activeModule === 'lights'" class="control-sections">
          <div class="control-section">
            <div class="section-content light-controls">
              <!-- 环境光控制 -->
              <div class="light-control-item">
                <span>环境光强度</span>
                <el-input-number
                  v-model="modelControls.lights.ambientIntensity"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  :precision="1"
                  size="small"
                  @change="(val) => handleLightChange('ambientLight', val)"
                />
              </div>
              
              <!-- 主光源控制 -->
              <div class="light-control-item">
                <span>主光源强度</span>
                <el-input-number
                  v-model="modelControls.lights.mainLightIntensity"
                  :min="0"
                  :max="2"
                  :step="0.1"
                  :precision="1"
                  size="small"
                  @change="(val) => handleLightChange('mainLight', val)"
                />
              </div>
              
              <!-- 补光控制 -->
              <div class="light-control-item">
                <span>补光强度</span>
                <el-input-number
                  v-model="modelControls.lights.fillLightIntensity"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  :precision="1"
                  size="small"
                  @change="(val) => handleLightChange('fillLight', val)"
                />
              </div>
              
              <!-- 半球光控制 -->
              <div class="light-control-item">
                <span>环境反射</span>
                <el-switch
                  v-model="modelControls.lights.shadowEnabled"
                  @change="(val) => $emit('shadow-change', val)"
                />
              </div>
              
              <!-- 主光源角度控制 -->
              <div class="light-control-group">
                <div class="group-header">
                  <span>主光源角度</span>
                </div>
                <div class="angle-controls">
                  <div class="angle-item">
                    <span>X轴</span>
                    <el-input-number
                      v-model="modelControls.lights.mainLightAngle.x"
                      :min="-180"
                      :max="180"
                      :step="5"
                      size="small"
                      @change="(val) => handleLightAngleChange('mainLight', 'x', val)"
                    />
                  </div>
                  <div class="angle-item">
                    <span>Y轴</span>
                    <el-input-number
                      v-model="modelControls.lights.mainLightAngle.y"
                      :min="-180"
                      :max="180"
                      :step="5"
                      size="small"
                      @change="(val) => handleLightAngleChange('mainLight', 'y', val)"
                    />
                  </div>
                  <div class="angle-item">
                    <span>Z轴</span>
                    <el-input-number
                      v-model="modelControls.lights.mainLightAngle.z"
                      :min="-180"
                      :max="180"
                      :step="5"
                      size="small"
                      @change="(val) => handleLightAngleChange('mainLight', 'z', val)"
                    />
                  </div>
                </div>
              </div>
              
              <!-- 补光角度控制 -->
              <div class="light-control-group">
                <div class="group-header">
                  <span>补光角度</span>
                </div>
                <div class="angle-controls">
                  <div class="angle-item">
                    <span>X轴</span>
                    <el-input-number
                      v-model="modelControls.lights.fillLightAngle.x"
                      :min="-180"
                      :max="180"
                      :step="5"
                      size="small"
                      @change="(val) => handleLightAngleChange('fillLight', 'x', val)"
                    />
                  </div>
                  <div class="angle-item">
                    <span>Y轴</span>
                    <el-input-number
                      v-model="modelControls.lights.fillLightAngle.y"
                      :min="-180"
                      :max="180"
                      :step="5"
                      size="small"
                      @change="(val) => handleLightAngleChange('fillLight', 'y', val)"
                    />
                  </div>
                  <div class="angle-item">
                    <span>Z轴</span>
                    <el-input-number
                      v-model="modelControls.lights.fillLightAngle.z"
                      :min="-180"
                      :max="180"
                      :step="5"
                      size="small"
                      @change="(val) => handleLightAngleChange('fillLight', 'z', val)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 视图操作固定在底部 -->
      <div class="view-controls-wrapper">
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
      </div>
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
  Camera,
  Sunny,
  Tools
} from '@element-plus/icons-vue'
import type { IModelControls } from '../types'
import { ref } from 'vue'

const props = defineProps({
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
  'scale-change',
  'light-change',
  'shadow-change',
  'light-angle-change'
])

const activeModule = ref('basic')
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

const handleLightChange = (lightType: string, value: number) => {
  console.log('发送光源变化事件:', lightType, value)
  emit('light-change', lightType, value)
}

// 修改光源角度变化处理函数
const handleLightAngleChange = (
  lightType: string,
  axis: string,
  value: number
) => {
  const currentAngles = props.modelControls.lights[`${lightType}Angle` as keyof typeof props.modelControls.lights]
  if (currentAngles && 'x' in currentAngles) {
    emit('light-angle-change', lightType, {
      x: currentAngles.x,
      y: currentAngles.y,
      z: currentAngles.z,
      [axis]: value
    })
  }
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

  .control-content {
    display: flex;
    flex-direction: column;
    height: calc(100% - 24px);
    
    .module-selector {
      margin-bottom: 20px;
      display: flex;
      justify-content: center;
      
      :deep(.el-radio-group) {
        .el-radio-button__inner {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 16px;
          
          .el-icon {
            font-size: 14px;
          }
        }
      }
    }
    
    .module-content {
      flex: 1;
      overflow-y: auto;
      padding-right: 4px;
      margin-bottom: 16px;
      
      &::-webkit-scrollbar {
        width: 4px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: var(--el-border-color-lighter);
        border-radius: 2px;
      }
    }
    
    .view-controls-wrapper {
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid var(--el-border-color-lighter);
      
      .el-divider {
        margin: 16px 0;
        
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
        
        &.light-controls {
          .light-control-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            
            &:last-child {
              margin-bottom: 0;
            }
            
            span {
              font-size: 13px;
              color: var(--el-text-color-regular);
            }
            
            .el-input-number {
              width: 120px;
            }
          }
          
          .light-control-group {
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid var(--el-border-color-lighter);

            .group-header {
              margin-bottom: 12px;
              
              span {
                font-size: 14px;
                font-weight: 500;
                color: var(--el-text-color-regular);
              }
            }

            .angle-controls {
              display: flex;
              flex-direction: column;
              gap: 12px;

              .angle-item {
                display: flex;
                justify-content: space-between;
                align-items: center;

                span {
                  font-size: 13px;
                  color: var(--el-text-color-regular);
                }

                .el-input-number {
                  width: 120px;
                }
              }
            }
          }
        }
        
        &.scale-control {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          span {
            font-size: 13px;
            color: var(--el-text-color-regular);
          }
          
          .el-input-number {
            width: 120px;
          }
        }
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