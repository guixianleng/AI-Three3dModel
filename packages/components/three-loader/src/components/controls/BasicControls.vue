<template>
  <div class="control-sections">
    <!-- 背景控制 -->
    <div class="control-section">
      <div class="section-header">
        <el-icon><Brush /></el-icon>
        <span>场景背景</span>
      </div>
      <div class="section-content">
        <div class="control-item">
          <div class="control-content render-controls">
            <div class="render-option">
              <span>背景类型</span>
              <el-radio-group v-model="backgroundOptions.type" size="small">
                <el-radio-button :value="BackgroundType.Color">纯色</el-radio-button>
                <el-radio-button :value="BackgroundType.Image">图片</el-radio-button>
              </el-radio-group>
            </div>
            <template v-if="backgroundOptions.type === BackgroundType.Color">
              <div class="render-option">
                <span>背景颜色</span>
                <el-color-picker
                  v-model="backgroundOptions.color"
                  show-alpha
                  size="small"
                  :predefine="predefineColors"
                  @change="handleBackgroundColorChange"
                />
              </div>
            </template>
            <template v-else>
              <div class="render-option">
                <span>背景图片</span>
                <div class="action-button">
                  <el-button type="primary" size="small" @click="refreshRandomImages">
                    <el-icon><Refresh /></el-icon>
                    换一批
                  </el-button>
                </div>
              </div>
              <div class="image-gallery">
                <div class="image-list">
                  <div
                    v-for="(image, index) in randomImages"
                    :key="index"
                    class="image-item"
                    :class="{ active: image === backgroundOptions.image }"
                    @click="selectBackgroundImage(image)"
                  >
                    <el-image :src="image" fit="cover" loading="lazy"> </el-image>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 动画控制 -->
    <div class="control-section">
      <div class="section-header">
        <el-icon><VideoPlay /></el-icon>
        <span>动画控制</span>
      </div>
      <div class="section-content">
        <div class="control-item">
          <div class="control-content render-controls">
            <div class="render-option">
              <span>动画播放</span>
              <el-button-group>
                <el-button
                  :type="isPlaying ? 'primary' : ''"
                  :disabled="isPlaying"
                  title="播放动画"
                  @click="sceneEvents?.startAnimation()"
                >
                  <el-icon><VideoPlay /></el-icon>
                </el-button>
                <el-button
                  :type="!isPlaying ? 'primary' : ''"
                  :disabled="!isPlaying"
                  title="暂停动画"
                  @click="sceneEvents?.pauseAnimation()"
                >
                  <el-icon><VideoPause /></el-icon>
                </el-button>
                <el-button title="重置动画" @click="sceneEvents?.resetAnimation()">
                  <el-icon><RefreshRight /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 地板控制 -->
    <div class="control-section">
      <div class="section-header">
        <el-icon><Grid /></el-icon>
        <span>地板控制</span>
      </div>
      <div class="section-content">
        <div class="control-item">
          <div class="control-content render-controls">
            <div class="render-group">
              <div class="render-option">
                <span>显示地板</span>
                <el-switch v-model="floorOptions.show" @change="sceneEvents?.toggleFloor" />
              </div>
              <template v-if="floorOptions.show">
                <div class="render-option">
                  <span>颜色</span>
                  <el-color-picker
                    v-model="floorOptions.color"
                    show-alpha
                    size="small"
                    :predefine="predefineColors"
                    @change="handleFloorColorChange"
                  />
                </div>
                <div class="render-option">
                  <span>透明度</span>
                  <div class="opacity-control">
                    <el-slider
                      v-model="floorOptions.opacity"
                      :min="0"
                      :max="1"
                      :step="0.1"
                      @change="handleFloorOpacityChange"
                    />
                    <span class="opacity-value">{{ floorOptions.opacity.toFixed(1) }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, reactive } from 'vue'
import { VideoPlay, VideoPause, RefreshRight, Brush, Refresh, Grid } from '@element-plus/icons-vue'
import type { SceneEvents } from '../../config/eventKeys'
import { SCENE_EVENTS_KEY } from '../../config/eventKeys'
import { defaultPredefineColors } from '../../config/colorConfig'
import { defaultModelConfig, BackgroundType } from '../../config/modelConfig'

defineProps<{
  isPlaying: boolean
}>()

// 注入场景事件
const sceneEvents = inject<SceneEvents>(SCENE_EVENTS_KEY)

// 使用预设颜色
const predefineColors = ref(defaultPredefineColors)

// 背景相关状态 - 从 modelConfig 获取
const backgroundOptions = reactive({
  ...defaultModelConfig.background,
})

// 地板配置 - 从 modelConfig.helperConfig 获取
const floorOptions = reactive({
  ...defaultModelConfig.helperConfig.floor,
})

// 处理背景颜色变化
const handleBackgroundColorChange = (color: string) => {
  sceneEvents?.updateBackground({
    type: BackgroundType.Color,
    value: color,
  })
}

// 随机图片列表
const randomImages = ref<string[]>([])

// 生成随机图片列表
const generateRandomImages = () => {
  const images: string[] = []
  const seed = Math.floor(Math.random() * 1000)

  for (let i = 0; i < 10; i++) {
    images.push(`https://picsum.photos/seed/${seed + i}/1920/1080`)
  }
  return images
}

// 刷新随机图片
const refreshRandomImages = async () => {
  try {
    backgroundOptions.image = ''

    const newImages = generateRandomImages()

    const loadedImages = await Promise.all(
      newImages.map(
        url =>
          new Promise<string>((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => resolve(url)
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
            img.src = url
          })
      )
    )

    randomImages.value = loadedImages
  } catch (error) {
    console.error('刷新随机图片失败:', error)
    randomImages.value = []
  }
}

// 选择背景图片
const selectBackgroundImage = async (image: string) => {
  try {
    backgroundOptions.type = BackgroundType.Image
    backgroundOptions.image = image

    await new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = resolve
      img.onerror = reject
      img.src = image
    })

    await sceneEvents?.updateBackground({
      type: BackgroundType.Image,
      value: image,
    })
  } catch (error) {
    console.error('选择背景图片失败:', error)
    backgroundOptions.type = BackgroundType.Color
    backgroundOptions.image = ''
  }
}

// 地板控制方法
const handleFloorColorChange = (color: string) => {
  if (floorOptions.show) {
    sceneEvents?.updateFloorColor(color)
  }
}

const handleFloorOpacityChange = (opacity: number) => {
  if (floorOptions.show) {
    sceneEvents?.updateFloorOpacity(opacity)
  }
}

// 初始化
onMounted(async () => {
  try {
    await refreshRandomImages()
  } catch (error) {
    console.error('初始化随机图片失败:', error)
  }
})
</script>

<style lang="scss" scoped>
@use './style.scss';

.image-gallery {
  margin-top: 12px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-fill-color-darker);

  .image-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 12px;

    .image-item {
      position: relative;
      aspect-ratio: 16/9;
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &.active {
        outline: 3px solid var(--el-color-primary);
        outline-offset: 2px;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(var(--el-color-primary-rgb), 0.2);
      }
    }
  }
}

// 复用 RenderControls 的地板控制样式
.render-controls {
  .render-group {
    position: relative;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: var(--el-fill-color-light);
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background: var(--el-fill-color);
    }

    &:last-child {
      margin-bottom: 0;
    }

    .render-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 32px;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      span {
        color: var(--el-text-color-primary);
        font-size: 14px;
      }

      .opacity-control {
        display: flex;
        align-items: center;
        flex: 1;
        margin-left: 16px;
        gap: 8px;

        .el-slider {
          flex: 1;
        }

        .opacity-value {
          min-width: 36px;
          padding: 2px 6px;
          text-align: center;
          background: var(--el-fill-color-darker);
          border-radius: 4px;
          color: var(--el-text-color-secondary);
          font-size: 12px;
        }
      }
    }
  }
}
</style>
