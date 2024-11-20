<template>
  <div class="control-sections">
    <!-- 环境光控制 -->
    <div class="control-section">
      <div class="section-header">
        <el-icon><Sunny /></el-icon>
        <span>环境光</span>
        <el-switch
          v-model="lights.ambient.enabled"
          @change="(val) => handleLightChange('ambient', 'enabled', val)"
          class="switch-inline"
        />
      </div>
      <div class="section-content" v-if="lights.ambient.enabled">
        <div class="control-item">
          <div class="control-content">
            <div class="control-row">
              <span>光照强度</span>
              <el-slider
                v-model="lights.ambient.intensity"
                :min="0"
                :max="2"
                :step="0.1"
                style="width: 140px"
                @change="(val) => handleLightChange('ambient', 'intensity', val)"
              />
            </div>
            <div class="control-row">
              <span>光照颜色</span>
              <el-color-picker
                v-model="lights.ambient.color"
                show-alpha
                size="small"
                :predefine="predefineColors"
                @change="(val) => handleLightChange('ambient', 'color', val)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 平行光控制 -->
    <div class="control-section">
      <div class="section-header">
        <el-icon><Sunny /></el-icon>
        <span>平行光</span>
        <el-switch
          v-model="lights.directional.enabled"
          @change="(val) => handleLightChange('directional', 'enabled', val)"
          class="switch-inline"
        />
      </div>
      <div class="section-content" v-if="lights.directional.enabled">
        <div class="control-item">
          <div class="control-content">
            <!-- 基础设置 -->
            <div class="control-row">
              <span>光照强度</span>
              <el-slider
                v-model="lights.directional.intensity"
                :min="0"
                :max="2"
                :step="0.1"
                style="width: 140px"
                @change="(val) => handleLightChange('directional', 'intensity', val)"
              />
            </div>
            <div class="control-row">
              <span>光照颜色</span>
              <el-color-picker
                v-model="lights.directional.color"
                show-alpha
                size="small"
                :predefine="predefineColors"
                @change="(val) => handleLightChange('directional', 'color', val)"
              />
            </div>

            <!-- 位置控制 -->
            <div class="control-row">
              <span>水平角度</span>
              <el-slider
                v-model="horizontalAngle"
                :min="-180"
                :max="180"
                :step="1"
                style="width: 140px"
                @change="updateLightPosition"
              />
            </div>
            <div class="control-row">
              <span>垂直角度</span>
              <el-slider
                v-model="verticalAngle"
                :min="-90"
                :max="90"
                :step="1"
                style="width: 140px"
                @change="updateLightPosition"
              />
            </div>
            <div class="control-row">
              <span>光源距离</span>
              <el-slider
                v-model="distance"
                :min="0"
                :max="200"
                :step="1"
                style="width: 140px"
                @change="updateLightPosition"
              />
            </div>

            <!-- 阴影设置 -->
            <div class="control-row">
              <span>启用阴影</span>
              <el-switch
                v-model="lights.directional.shadow.enabled"
                @change="(val) => handleLightChange('directional', 'shadow.enabled', val)"
              />
            </div>

            <!-- 辅助线设置 -->
            <div class="control-row">
              <span>显示辅助线</span>
              <el-switch
                v-model="showHelper"
                @change="(val) => handleLightChange('directional', 'helper', val)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 点光源控制 -->
    <div class="control-section">
      <div class="section-header">
        <el-icon><Sunny /></el-icon>
        <span>点光源</span>
        <el-switch
          v-model="lights.point.enabled"
          @change="(val) => handleLightChange('point', 'enabled', val)"
          class="switch-inline"
        />
      </div>
      <div class="section-content" v-if="lights.point.enabled">
        <div class="control-item">
          <div class="control-content">
            <!-- 基础设置 -->
            <div class="control-row">
              <span>光照强度</span>
              <el-slider
                v-model="lights.point.intensity"
                :min="0"
                :max="2"
                :step="0.1"
                style="width: 140px"
                @change="(val) => handleLightChange('point', 'intensity', val)"
              />
            </div>
            <div class="control-row">
              <span>光照颜色</span>
              <el-color-picker
                v-model="lights.point.color"
                show-alpha
                size="small"
                :predefine="predefineColors"
                @change="(val) => handleLightChange('point', 'color', val)"
              />
            </div>

            <!-- 位置控制 -->
            <div class="control-row">
              <span>水平角度</span>
              <el-slider
                v-model="pointHorizontalAngle"
                :min="-180"
                :max="180"
                :step="1"
                style="width: 140px"
                @change="updatePointLightPosition"
              />
            </div>
            <div class="control-row">
              <span>垂直角度</span>
              <el-slider
                v-model="pointVerticalAngle"
                :min="-90"
                :max="90"
                :step="1"
                style="width: 140px"
                @change="updatePointLightPosition"
              />
            </div>
            <div class="control-row">
              <span>光源距离</span>
              <el-slider
                v-model="pointDistance"
                :min="0"
                :max="200"
                :step="1"
                style="width: 140px"
                @change="updatePointLightPosition"
              />
            </div>

            <!-- 辅助线设置 -->
            <div class="control-row">
              <span>显示辅助线</span>
              <el-switch
                v-model="showPointHelper"
                @change="(val) => handleLightChange('point', 'helper', val)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import { Sunny } from '@element-plus/icons-vue'
import type { IModelControls } from '../../types'
import { LIGHTS_KEY } from '../../hooks/useThreeScene'

const props = defineProps<{
  lights: IModelControls['lights']
}>()

const emit = defineEmits<{
  (e: 'light-change', lightType: string, property: string, value: any): void
}>()

// 注入 useThreLights 实例
const lightUtils = inject(LIGHTS_KEY)

// 平行光位置控制
const horizontalAngle = ref(45)
const verticalAngle = ref(45)
const distance = ref(100)
const showHelper = ref(false)

// 点光源位置控制
const pointHorizontalAngle = ref(45)
const pointVerticalAngle = ref(45)
const pointDistance = ref(100)
const showPointHelper = ref(false)

// 预设颜色
const predefineColors = ref([
  '#ff9900',  // 暖黄色
  '#ffffff',  // 白色
  '#2468f2',  // 蓝色
  '#67c23a',  // 绿色
  '#f56c6c',  // 红色
  '#b643cd'   // 紫色
])

// 更新光源位置
const updateLightPosition = () => {
  // 将角度转换为弧度
  const horizontalRad = (horizontalAngle.value * Math.PI) / 180
  const verticalRad = (verticalAngle.value * Math.PI) / 180

  // 计算新的位置
  const x = distance.value * Math.cos(verticalRad) * Math.cos(horizontalRad)
  const y = distance.value * Math.sin(verticalRad)
  const z = distance.value * Math.cos(verticalRad) * Math.sin(horizontalRad)

  // 更新光源位置
  if (lightUtils?.updateLight) {
    lightUtils.updateLight('directional', {
      ...props.lights.directional,
      position: { x, y, z },
      // 确保其他必要的属性也被传递
      enabled: props.lights.directional.enabled,
      intensity: props.lights.directional.intensity,
      color: props.lights.directional.color,
      shadow: props.lights.directional.shadow
    })
  }

  console.log('更新光源位置:', { x, y, z, distance: distance.value })
}

// 更新点光源位置
const updatePointLightPosition = () => {
  // 将角度转换为弧度
  const horizontalRad = (pointHorizontalAngle.value * Math.PI) / 180
  const verticalRad = (pointVerticalAngle.value * Math.PI) / 180

  // 计算新的位置
  const x = pointDistance.value * Math.cos(verticalRad) * Math.cos(horizontalRad)
  const y = pointDistance.value * Math.sin(verticalRad)
  const z = pointDistance.value * Math.cos(verticalRad) * Math.sin(horizontalRad)

  // 更新光源位置
  if (lightUtils?.updateLight) {
    lightUtils.updateLight('point', {
      ...props.lights.point,
      position: { x, y, z },
      enabled: props.lights.point.enabled,
      intensity: props.lights.point.intensity,
      color: props.lights.point.color,
      shadow: props.lights.point.shadow
    })
  }

  console.log('更新点光源位��:', { x, y, z, distance: pointDistance.value })
}

// 初始化时设置初始位置
onMounted(() => {
  // 从当前光源位置计算初始角度和距离
  const pos = props.lights.directional.position
  
  // 计算距离
  distance.value = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z)
  
  // 计算水平角度（弧度转角度）
  horizontalAngle.value = Math.atan2(pos.z, pos.x) * (180 / Math.PI)
  
  // 计算垂直角度（弧度转角度）
  const horizontalDistance = Math.sqrt(pos.x * pos.x + pos.z * pos.z)
  verticalAngle.value = Math.atan2(pos.y, horizontalDistance) * (180 / Math.PI)

  // 从当前光源位置计算点光源初始角度和距离
  const pointPos = props.lights.point.position
  
  // 计算距离
  pointDistance.value = Math.sqrt(pointPos.x * pointPos.x + pointPos.y * pointPos.y + pointPos.z * pointPos.z)
  
  // 计算水平角度（弧度转角度）
  pointHorizontalAngle.value = Math.atan2(pointPos.z, pointPos.x) * (180 / Math.PI)
  
  // 计算垂直角度（弧度转角度）
  const horizontalDistancePoint = Math.sqrt(pointPos.x * pointPos.x + pointPos.z * pointPos.z)
  pointVerticalAngle.value = Math.atan2(pointPos.y, horizontalDistancePoint) * (180 / Math.PI)
})

const handleLightChange = (lightType: string, property: string, value: any) => {
  // 发出事件
  emit('light-change', lightType, property, value)
  
  // 使用注入的 updateLight 函数
  if (lightUtils?.updateLight) {
    // 如果是更改颜色、强度、开关或辅助线，保持当前位置
    if (property === 'color' || property === 'intensity' || property === 'enabled' || property === 'shadow.enabled' || property === 'helper') {
      // 根据光源类型选择正确的位置信息
      const currentPosition = lightType === 'directional' ? 
        {
          x: distance.value * Math.cos(verticalAngle.value * Math.PI / 180) * Math.cos(horizontalAngle.value * Math.PI / 180),
          y: distance.value * Math.sin(verticalAngle.value * Math.PI / 180),
          z: distance.value * Math.cos(verticalAngle.value * Math.PI / 180) * Math.sin(horizontalAngle.value * Math.PI / 180)
        } :
        {
          x: pointDistance.value * Math.cos(pointVerticalAngle.value * Math.PI / 180) * Math.cos(pointHorizontalAngle.value * Math.PI / 180),
          y: pointDistance.value * Math.sin(pointVerticalAngle.value * Math.PI / 180),
          z: pointDistance.value * Math.cos(pointVerticalAngle.value * Math.PI / 180) * Math.sin(pointHorizontalAngle.value * Math.PI / 180)
        }

      lightUtils.updateLight(lightType, {
        ...props.lights[lightType],
        [property]: value,
        position: currentPosition // 使用当前计算的位置
      })
    } else {
      // 其他情况正常更新
      lightUtils.updateLight(lightType, {
        ...props.lights[lightType],
        [property]: value
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.control-sections {
  height: calc(100vh - 350px);
  overflow: auto;
  .control-section {
    background: var(--el-fill-color-light);
    border-radius: 8px;
    padding: 6px 20px 1px;
    margin-bottom: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

    &:last-child {
      margin-bottom: 0;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      font-weight: bold;
      font-size: 16px;
      color: var(--el-text-color-primary);

      .switch-inline {
        margin-left: auto;
      }
    }

    .control-item {
      border-radius: 6px;
      padding-bottom: 20px;
      
      .control-content {
        .control-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-size: 14px;
          color: var(--el-text-color-regular);

          &:last-child {
            margin-bottom: 0;
          }

          // 调整滑块和选择器的宽度
          .el-slider, .el-select {
            width: 140px;
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

// 调整选择器样式
:deep(.el-select) {
  .el-input__wrapper {
    padding: 0 8px;
  }
}
</style>
