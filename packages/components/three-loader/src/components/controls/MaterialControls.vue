<template>
  <div class="material-controls">
    <!-- 1. 模型材质类型选择 -->
    <div class="control-section">
      <div class="section-header">
        <span class="section-title">当前材质类型</span>
        <el-tooltip
          content="选择材质类型后，将应用到所有选中的模型部件"
          placement="top"
        >
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>
      <div class="material-type-select">
        <el-select
          v-model="modelMaterialType"
          placeholder="选择模型材质类型"
          @change="handleModelMaterialTypeChange"
          class="material-select"
        >
          <el-option
            v-for="type in materialTypeOptions"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          >
            <div class="material-option">
              <span class="material-name">{{ type.label }}</span>
              <span class="material-desc">({{ getMaterialDesc(type.value) }})</span>
            </div>
          </el-option>
        </el-select>
      </div>
    </div>

    <!-- 2. 模型部件材质列表 -->
    <div class="control-section">
      <div class="section-header">
        <span class="section-title">模型材质</span>
        <el-tooltip
          content="选择要编辑的模型部件材质"
          placement="top"
        >
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>
      <el-scrollbar height="200px" class="material-list-container">
        <div class="material-list">
          <div
            v-for="material in materialList"
            :key="material.name"
            class="material-item"
            :class="{ 
              'is-selected': material.selected,
              'is-current': material.name === currentMaterialName 
            }"
            @click="handleMaterialSelect(material.name)"
          >
            <el-icon
              class="visibility-icon"
              @click.stop="handleToggleVisibility(material.name)"
            >
              <View v-if="material.visible" />
              <Hide v-else />
            </el-icon>
            <div class="material-info">
              <span class="material-name">{{ material.name }}</span>
              <span class="material-type">{{ MaterialTypeNames[material.type] }}</span>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 3. 材质属性 -->
    <div v-if="currentMaterial" class="control-section">
      <div class="section-header">
        <span class="section-title">材质属性</span>
      </div>
      <div class="material-properties">
        <!-- 颜色选择器 -->
        <div class="property-item">
          <span class="property-label">材质颜色</span>
          <el-color-picker
            v-model="materialColor"
            show-alpha
            @change="handleColorChange"
            class="property-control"
          />
        </div>

        <!-- 深度写入开关 -->
        <div class="property-item">
          <span class="property-label">深度写入</span>
          <el-switch
            v-model="depthWrite"
            @change="handleDepthWriteChange"
            class="property-control"
          />
        </div>

        <!-- 网格显示开关 -->
        <div class="property-item">
          <span class="property-label">网格显示</span>
          <el-switch
            v-model="wireframe"
            @change="handleWireframeChange"
            class="property-control"
          />
        </div>

        <!-- 透明度滑块 -->
        <div class="property-item">
          <span class="property-label">透明度</span>
          <el-slider
            v-model="opacity"
            :min="0"
            :max="1"
            :step="0.01"
            @change="handleOpacityChange"
            class="property-control"
          />
        </div>
      </div>
    </div>

    <!-- 4. 当前材质贴图 -->
    <div v-if="currentMaterial" class="control-section">
      <div class="section-header">
        <span class="section-title">当前材质自带贴图</span>
        <el-button 
          v-if="currentMaterial.map"
          size="small" 
          type="danger" 
          @click="handleRemoveTexture"
        >
          移除贴图
        </el-button>
      </div>
      <div 
        class="texture-preview" 
        :class="{ 'has-texture': currentMaterial.map }"
        v-if="currentMaterial.map"
      >
        <img :src="currentMaterial.map" alt="材质贴图" />
      </div>
      <div v-else class="no-texture">
        <el-empty description="暂无贴图" :image-size="50" />
      </div>
    </div>

    <!-- 5. 系统贴图 -->
    <div class="control-section">
      <div class="section-header">
        <span class="section-title">系统贴图</span>
        <div class="header-actions">
          <el-button size="small" type="primary" @click="refreshSystemTextures">
            <el-icon><Refresh /></el-icon>
            刷新贴图
          </el-button>
          <el-button size="small" type="success" @click="handleAddExternalTexture">
            <el-icon><Upload /></el-icon>
            加载外部贴图
          </el-button>
        </div>
      </div>
      <el-scrollbar height="300px" class="texture-grid-container">
        <div class="texture-grid">
          <div
            v-for="(texture, index) in systemTextures"
            :key="texture"
            class="texture-item"
            :class="{ 'is-selected': texture === selectedTexture }"
            @click="handleTextureSelect(texture)"
          >
            <el-image
              :src="texture"
              fit="cover"
              loading="lazy"
              :preview-src-list="[texture]"
              :initial-index="index"
              class="texture-image"
            >
              <template #placeholder>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
              <template #error>
                <div class="image-error">
                  <el-icon><PictureRounded /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="texture-mask">
              <el-icon><Check /></el-icon>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { View, Hide, Check, Refresh, Upload, Picture, PictureRounded, QuestionFilled } from '@element-plus/icons-vue'
import type { IMaterialOptions, IMaterialUpdateOptions } from '../../types/materials'
import { MaterialType, MaterialTypeNames } from '../../types/materials'

const props = defineProps<{
  materialList: IMaterialOptions[]
}>()

const emit = defineEmits<{
  (e: 'update-material', name: string, property: string, value: any): void
  (e: 'convert-material', name: string, type: MaterialType): void
}>()

// 当前选中的材质名称
const currentMaterialName = ref('')

// 计算当前选中的材质
const currentMaterial = computed(() => 
  props.materialList.find(m => m.name === currentMaterialName.value)
)

// 材质属性
const materialColor = ref('#ffffff')
const depthWrite = ref(true)
const wireframe = ref(false)
const opacity = ref(1)

// 当前模型材质类型
const modelMaterialType = ref<MaterialType>(MaterialType.Phong)

// 材质类型选项
const materialTypeOptions = Object.entries(MaterialTypeNames).map(([value, label]) => ({
  value: value as MaterialType,
  label,
}))

// 生成随机种子
const generateRandomSeed = () => Math.floor(Math.random() * 1000)

// 生成系统贴图列表
const generateSystemTextures = (count: number = 15) => {
  return Array.from({ length: count }, (_, i) => {
    const seed = generateRandomSeed() + i
    return `https://picsum.photos/seed/${seed}/1920/1080`
  })
}

// 系统贴图列表
const systemTextures = ref(generateSystemTextures())

// 添加刷新贴图的功能
const refreshSystemTextures = () => {
  systemTextures.value = generateSystemTextures()
}

// 当前选中的贴图
const selectedTexture = ref<string | null>(null)

// 获取材质类型描述
const getMaterialDesc = (type: MaterialType) => {
  switch (type) {
    case MaterialType.Basic: return '默认材质'
    case MaterialType.Lambert: return '漫反射'
    case MaterialType.Phong: return '高光'
    case MaterialType.Standard: return 'PBR'
    case MaterialType.Physical: return '高级PBR'
    case MaterialType.Toon: return '卡通'
    case MaterialType.Matcap: return '预烘焙'
    default: return ''
  }
}

// 监听当前材质变化
watch(currentMaterial, (newMaterial) => {
  if (newMaterial) {
    materialColor.value = newMaterial.color ? 
      '#' + newMaterial.color.toString(16).padStart(6, '0') : 
      '#ffffff'
    depthWrite.value = newMaterial.depthWrite ?? true
    wireframe.value = newMaterial.wireframe
    opacity.value = newMaterial.opacity
    modelMaterialType.value = newMaterial.type
    selectedTexture.value = newMaterial.map || null
  }
})

// 处理材质选择
const handleMaterialSelect = (name: string) => {
  currentMaterialName.value = name
  emit('update-material', name, 'select', true)
}

// 处理模型材质类型变化
const handleModelMaterialTypeChange = (type: MaterialType) => {
  modelMaterialType.value = type
  // 发送一次更新事件，更新所有材质的类型
  emit('update-material', 'all', 'type', type)
}

// 处理可见性切换
const handleToggleVisibility = (name: string) => {
  const material = props.materialList.find(m => m.name === name)
  if (material) {
    emit('update-material', name, 'visible', !material.visible)
  }
}

// 处理颜色变化
const handleColorChange = (color: string) => {
  if (currentMaterialName.value) {
    const hex = parseInt(color.slice(1), 16)
    emit('update-material', currentMaterialName.value, 'color', hex)
  }
}

// 处理深度写入变化
const handleDepthWriteChange = (value: boolean) => {
  if (currentMaterialName.value) {
    emit('update-material', currentMaterialName.value, 'depthWrite', value)
  }
}

// 处理网格显示变化
const handleWireframeChange = (value: boolean) => {
  if (currentMaterialName.value) {
    emit('update-material', currentMaterialName.value, 'wireframe', value)
  }
}

// 处理透明度变化
const handleOpacityChange = (value: number) => {
  if (currentMaterialName.value) {
    emit('update-material', currentMaterialName.value, 'opacity', value)
  }
}

// 处理贴图选择
const handleTextureSelect = (texture: string) => {
  if (currentMaterialName.value) {
    selectedTexture.value = texture
    emit('update-material', currentMaterialName.value, 'map', texture)
  }
}

// 处理添加外部贴图
const handleAddExternalTexture = () => {
  // TODO: 实现外部贴图上传功能
}

// 添加移除贴图的处理函数
const handleRemoveTexture = () => {
  if (currentMaterialName.value) {
    selectedTexture.value = null
    emit('update-material', currentMaterialName.value, 'map', null)
  }
}
</script>

<style lang="scss" scoped>
.material-controls {
  padding: 0 10px;
  box-sizing: border-box;
  height: calc(100vh - 130px);
  overflow-y: auto;

  .control-section {
    margin-bottom: 20px;
    background: var(--el-bg-color);
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .section-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .help-icon {
        font-size: 16px;
        color: var(--el-text-color-secondary);
        cursor: help;
        margin-left: 4px;
      }
    }
  }

  .material-type-select {
    .material-select {
      width: 100%;
    }

    .material-option {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .material-name {
        font-weight: 500;
      }

      .material-desc {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .material-list-container {
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;

    :deep(.el-scrollbar__wrap) {
      overflow-x: hidden;
    }
  }

  .material-list {
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;

    .material-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      cursor: pointer;
      transition: all 0.3s;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &.is-selected {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }

      &.is-current {
        background-color: var(--el-color-success-light-9);
        border-left: 3px solid var(--el-color-success);
      }

      .visibility-icon {
        margin-right: 8px;
        font-size: 16px;
        color: var(--el-text-color-secondary);
        cursor: pointer;

        &:hover {
          color: var(--el-color-primary);
        }
      }

      .material-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;

        .material-name {
          font-weight: 500;
        }

        .material-type {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .material-properties {
    background-color: var(--el-fill-color-blank);
    border-radius: 8px;
    padding: 12px;

    .property-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .property-label {
        font-size: 14px;
        color: var(--el-text-color-regular);
      }

      .property-control {
        flex: 1;
        max-width: 200px;
        margin-left: 16px;
      }

      :deep(.el-slider) {
        margin-top: 0;
        margin-bottom: 0;
      }
    }
  }

  .texture-preview {
    width: 100%;
    height: 120px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    overflow: hidden;
    transition: all 0.3s;

    &.has-texture {
      border-color: var(--el-color-primary);
      border-width: 2px;
      box-shadow: 0 0 8px rgba(var(--el-color-primary-rgb), 0.2);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #f5f5f5;
    }
  }

  .no-texture {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }

  .texture-grid-container {
    :deep(.el-scrollbar__wrap) {
      overflow-x: hidden;
    }
  }

  .texture-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
    padding: 8px;

    .texture-item {
      position: relative;
      
      .texture-mask {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: none;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        font-size: 20px;
      }

      &.is-selected {
        border-color: var(--el-color-primary);
        border-width: 2px;

        .texture-mask {
          display: flex;
        }
      }

      &:hover {
        .texture-mask {
          display: flex;
          background-color: rgba(0, 0, 0, 0.3);
        }
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  .texture-grid {
    .texture-item {
      aspect-ratio: 16/9;
      border: 1px solid var(--el-border-color-light);
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }

      &.is-selected {
        border-color: var(--el-color-primary);
        border-width: 2px;
        transform: translateY(-2px);
        box-shadow: 0 4px 16px 0 rgba(var(--el-color-primary-rgb), 0.2);
      }

      .texture-image {
        width: 100%;
        height: 100%;
      }

      .image-placeholder,
      .image-error {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--el-fill-color-light);
        color: var(--el-text-color-secondary);
        font-size: 24px;
      }
    }
  }
}

// 暗黑模式适配
:deep(html.dark) {
  .material-controls {
    .control-section {
      background: var(--el-bg-color-overlay);
    }

    .material-item {
      &:hover {
        background-color: var(--el-fill-color-darker);
      }

      &.is-selected {
        background-color: var(--el-color-primary-dark-9);
      }
    }

    .texture-preview img {
      background: var(--el-fill-color-darker);
    }

    .image-placeholder,
    .image-error {
      background-color: var(--el-fill-color-darker);
    }
  }

  .material-properties {
    background-color: var(--el-bg-color);
  }
}
</style>