<template>
  <div class="control-sections">
    <!-- 环境光控制 -->
    <div class="control-section">
      <div class="section-header">
        <el-icon><Sunny /></el-icon>
        <span>环境光</span>
        <el-switch
          v-model="localLights.ambient.enabled"
          class="switch-inline"
          @change="val => handleLightChange('ambient', 'enabled', val)"
        />
      </div>
      <div v-if="localLights.ambient.enabled" class="section-content">
        <div class="control-item">
          <div class="control-content">
            <div class="control-row">
              <span>光照强度</span>
              <el-slider
                v-model="localLights.ambient.intensity"
                :min="0"
                :max="2"
                :step="0.1"
                style="width: 140px"
                @change="val => handleLightChange('ambient', 'intensity', val)"
              />
            </div>
            <div class="control-row">
              <span>光照颜色</span>
              <el-color-picker
                v-model="localLights.ambient.color"
                show-alpha
                size="small"
                :predefine="predefineColors"
                @change="val => handleLightChange('ambient', 'color', val)"
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
          v-model="localLights.directional.enabled"
          class="switch-inline"
          @change="val => handleLightChange('directional', 'enabled', val)"
        />
      </div>
      <div v-if="localLights.directional.enabled" class="section-content">
        <div class="control-item">
          <div class="control-content">
            <!-- 基础设置 -->
            <div class="control-row">
              <span>光照强度</span>
              <el-slider
                v-model="localLights.directional.intensity"
                :min="0"
                :max="2"
                :step="0.1"
                style="width: 140px"
                @change="val => handleLightChange('directional', 'intensity', val)"
              />
            </div>
            <div class="control-row">
              <span>光照颜色</span>
              <el-color-picker
                v-model="localLights.directional.color"
                show-alpha
                size="small"
                :predefine="predefineColors"
                @change="val => handleLightChange('directional', 'color', val)"
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
                v-model="localLights.directional.shadow.enabled"
                @change="val => handleLightChange('directional', 'shadow.enabled', val)"
              />
            </div>

            <!-- 辅助线设置 -->
            <div class="control-row">
              <span>显示辅助线</span>
              <el-switch
                v-model="showHelper"
                @change="val => handleLightChange('directional', 'helper', val)"
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
          v-model="localLights.point.enabled"
          class="switch-inline"
          @change="val => handleLightChange('point', 'enabled', val)"
        />
      </div>
      <div v-if="localLights.point.enabled" class="section-content">
        <div class="control-item">
          <div class="control-content">
            <!-- 基础设置 -->
            <div class="control-row">
              <span>光照强度</span>
              <el-slider
                v-model="localLights.point.intensity"
                :min="0"
                :max="2"
                :step="0.1"
                style="width: 140px"
                @change="val => handleLightChange('point', 'intensity', val)"
              />
            </div>
            <div class="control-row">
              <span>光照颜色</span>
              <el-color-picker
                v-model="localLights.point.color"
                show-alpha
                size="small"
                :predefine="predefineColors"
                @change="val => handleLightChange('point', 'color', val)"
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
                @change="val => handleLightChange('point', 'helper', val)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, reactive } from 'vue'
import { Sunny } from '@element-plus/icons-vue'
import type { SceneLightsConfig } from '../../types/lights'
import { defaultPredefineColors } from '../../config/colorConfig'
import type { SceneEvents } from '../../config/eventKeys'
import { SCENE_EVENTS_KEY } from '../../config/eventKeys'

const props = defineProps<{
  lights: SceneLightsConfig
}>()

// 注入场景事件
const sceneEvents = inject<SceneEvents>(SCENE_EVENTS_KEY)

const localLights = reactive({
  ...props.lights,
})

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
const predefineColors = ref(defaultPredefineColors)

/**
 * 处理光源变化
 */
const handleLightChange = (lightType: string, property: string, value: any) => {
  sceneEvents?.lightChange(lightType, property, value)
}

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
  sceneEvents?.lightChange('directional', 'position', { x, y, z })
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
  sceneEvents?.lightChange('point', 'position', { x, y, z })
}
</script>

<style lang="scss" scoped>
.control-sections {
  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    font-weight: bold;
    font-size: 15px;
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

        .el-slider,
        .el-select {
          width: 140px;
        }
      }
    }
  }
}
</style>
