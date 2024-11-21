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
              <el-radio-group v-model="backgroundType" size="small">
                <el-radio-button :value="BackgroundType.Color">纯色</el-radio-button>
                <el-radio-button :value="BackgroundType.Image">图片</el-radio-button>
              </el-radio-group>
            </div>
            <template v-if="backgroundType === BackgroundType.Color">
              <div class="render-option">
                <span>背景颜色</span>
                <el-color-picker
                  v-model="backgroundColor"
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
                  <el-button 
                    type="primary" 
                    size="small"
                    @click="refreshRandomImages"
                  >
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
                    :class="{ active: image === backgroundImage }"
                    @click="selectBackgroundImage(image)"
                  >
                    <el-image
                      :src="image"
                      fit="cover"
                      loading="lazy"
                    >
                    </el-image>
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
                  @click="sceneEvents?.startAnimation()"
                  :disabled="isPlaying"
                  title="播放动画"
                >
                  <el-icon><VideoPlay /></el-icon>
                </el-button>
                <el-button
                  :type="!isPlaying ? 'primary' : ''"
                  @click="sceneEvents?.pauseAnimation()"
                  :disabled="!isPlaying"
                  title="暂停动画"
                >
                  <el-icon><VideoPause /></el-icon>
                </el-button>
                <el-button 
                  @click="sceneEvents?.resetAnimation()"
                  title="重置动画"
                >
                  <el-icon><RefreshRight /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, inject, onMounted } from 'vue'
import { 
  ZoomIn, VideoPlay, VideoPause, RefreshRight, 
  Brush, Picture, Refresh, Select 
} from '@element-plus/icons-vue'
import type { SceneEvents } from '../../config/eventKeys'
import { SCENE_EVENTS_KEY } from '../../config/eventKeys'
import { defaultPredefineColors } from '../../config/colorConfig'
import { defaultHelperConfig, BackgroundType } from '../../config/helperConfig'

const props = defineProps<{
  scale: number
  isPlaying: boolean
}>()

// 注入场景事件
const sceneEvents = inject<SceneEvents>(SCENE_EVENTS_KEY)

// 本地缩放值
const localScale = ref(props.scale)

// 使用预设颜色
const predefineColors = ref(defaultPredefineColors)
// 背景相关状态
const backgroundType = ref(defaultHelperConfig.backgroundType)
const backgroundColor = ref(defaultHelperConfig.backgroundColor)
const backgroundImage = ref(defaultHelperConfig.backgroundImage)

// 监听 props 变化
watch(() => props.scale, (newScale) => {
  localScale.value = newScale
})

// 处理背景颜色变化
const handleBackgroundColorChange = (color: string) => {
  sceneEvents?.updateBackground({
    type: BackgroundType.Color,
    value: color
  })
}

// 随机图片列表
const randomImages = ref<string[]>([])

// 生成随机图片列表
const generateRandomImages = () => {
  const images: string[] = []
  const seed = Math.floor(Math.random() * 1000)  // 使用随机种子
  
  for (let i = 0; i < 10; i++) {
    // 使用固定的图片ID，确保每次获取相同的图片
    images.push(`https://picsum.photos/seed/${seed + i}/1920/1080`)
  }
  return images
}

// 刷新随机图片
const refreshRandomImages = async () => {
  try {
    // 清空当前选择
    backgroundImage.value = ''
    
    // 生成新的图片列表
    const newImages = generateRandomImages()
    
    // 预加载所有图片
    const loadedImages = await Promise.all(
      newImages.map(url => 
        new Promise<string>((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => resolve(url)
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
          img.src = url
        })
      )
    )

    // 更新图片列表
    randomImages.value = loadedImages
  } catch (error) {
    console.error('刷新随机图片失败:', error)
    randomImages.value = []  // 清空列表
  }
}

// 选择背景图片
const selectBackgroundImage = async (image: string) => {
  try {
    // 设置类型为图片
    backgroundType.value = BackgroundType.Image
    
    // 设置选中状态
    backgroundImage.value = image
    
    // 确保图片已加载
    await new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = resolve
      img.onerror = reject
      img.src = image
    })

    // 更新场景背景
    await sceneEvents?.updateBackground({
      type: BackgroundType.Image,
      value: image
    })
  } catch (error) {
    console.error('选择背景图片失败:', error)
    // 恢复到颜色模式
    backgroundType.value = BackgroundType.Color
    backgroundImage.value = ''
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
</style> 