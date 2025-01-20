<template>
  <div class="model-controls">
    <!-- 控制面板头部 -->
    <div class="controls-header">
      <el-radio-group v-model="activeModule" size="large">
        <el-radio-button label="transform">变换</el-radio-button>
        <el-radio-button label="light">光源</el-radio-button>
        <el-radio-button label="material">材质</el-radio-button>
        <el-radio-button label="scene">场景</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 控制面板内容 -->
    <div class="controls-content">
      <TransformControls v-if="activeModule === 'transform'" />
      <LightControls v-if="activeModule === 'light'" />
      <MaterialControls 
        v-if="activeModule === 'material'" 
        :material-list="modelControls.materials"
        @update-material="handleMaterialUpdate"
        @convert-material="handleMaterialConvert"
      />
      <SceneControls v-if="activeModule === 'scene'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { IModelControls } from '../../types/modelControls'
import type { IMaterialUpdateOptions } from '../../types/materials'
import type { MaterialType } from '../../types/materials'
import TransformControls from './TransformControls.vue'
import LightControls from './LightControls.vue'
import MaterialControls from './MaterialControls.vue'
import SceneControls from './SceneControls.vue'

const props = defineProps<{
  modelControls: IModelControls
  updateMaterials: (options: IMaterialUpdateOptions) => void
}>()

const activeModule = ref('transform')

// 处理材质更新
const handleMaterialUpdate = (name: string, property: string, value: any) => {
  props.updateMaterials({ name, property, value })
}

// 处理材质转换
const handleMaterialConvert = (name: string, type: MaterialType) => {
  // TODO: 实现材质转换逻辑
}
</script> 