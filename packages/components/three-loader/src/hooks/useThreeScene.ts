import * as THREE from 'three'
import { ref, shallowRef, onMounted, onBeforeUnmount, provide } from 'vue'
import { useThreeLights } from './useThreeLights'
import { useThreeCamera } from './useThreeCamera'
import { useThreeControls } from './useThreeControls'
import { useThreeHelper } from './useThreeHelper'

import type { ISceneOptions } from '../types/scene'
import { defaultLightConfig } from '../config/lightConfig'
import { defaultHelperConfig, BackgroundType } from '../config/helperConfig'

export const LIGHTS_KEY = Symbol('lights')

/**
 * Three.js 场景管理 Hook
 */
export function useThreeScene(options: ISceneOptions = {}) {
  const {
    camera: cameraOptions,
    lights: lightConfig = defaultLightConfig,
    controls: controlsOptions,
    helper: helperOptions = defaultHelperConfig
  } = options

  // 场景相关引用
  const threeContainer = ref<HTMLElement>()
  const scene = shallowRef<THREE.Scene | null>(null)
  let renderer: THREE.WebGLRenderer

  // 引入相关的 hooks
  const lightUtils = useThreeLights()
  const { addLightsToScene, removeLightsFromScene, updateLight } = lightUtils
  provide(LIGHTS_KEY, lightUtils)

  const { 
    camera, 
    createCamera, 
    updateAspect,
    dispose: disposeCamera 
  } = useThreeCamera(cameraOptions)

  const { 
    controls,
    setCamera,
    createControls,
    updateControls,
    dispose: disposeControls
  } = useThreeControls(undefined, controlsOptions)

  const {
    createFloor,
    createStats,
    toggleGrid,
    toggleStats,
    toggleAxes,
    toggleFloor,
    updateStats,
    updateFloorColor,
    dispose: disposeHelper
  } = useThreeHelper(helperOptions)

  /**
   * 创建渲染器
   */
  const createRenderer = (container: HTMLElement) => {
    try {
      const newRenderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
      })
      newRenderer.setSize(container.clientWidth, container.clientHeight)
      newRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))  // 限制像素比以优化性能
      newRenderer.shadowMap.enabled = true
      newRenderer.shadowMap.type = THREE.PCFSoftShadowMap
      newRenderer.outputEncoding = THREE.sRGBEncoding
      newRenderer.toneMapping = THREE.ACESFilmicToneMapping
      container.appendChild(newRenderer.domElement)
      return newRenderer
    } catch (error) {
      console.error('创建渲染器失败:', error)
      return null
    }
  }

  /**
   * 初始化场景
   */
  const initScene = async () => {
    return new Promise<THREE.Scene>((resolve, reject) => {
      requestAnimationFrame(() => {
        try {
          if (!threeContainer.value) {
            throw new Error('容器元素未找到')
          }

          // 创建场景
          scene.value = new THREE.Scene()
          scene.value.background = new THREE.Color(helperOptions.backgroundColor)

          // 创建相机
          const aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight
          const newCamera = createCamera(aspect)
          if (!newCamera) throw new Error('相机创建失败')
          setCamera(newCamera)

          // 创建渲染器
          const newRenderer = createRenderer(threeContainer.value)
          if (!newRenderer) throw new Error('渲染器创建失败')
          renderer = newRenderer

          // 创建控制器
          const newControls = createControls(renderer.domElement)
          if (!newControls) throw new Error('控制器创建失败')

          // 添加光源
          const lights = addLightsToScene(scene.value, lightConfig)
          if (!lights) throw new Error('光源初始化失败')

          // 添加辅助工具
          createFloor(scene.value)
          createStats(threeContainer.value)

          // 开始渲染循环
          const renderLoop = () => {
            requestAnimationFrame(renderLoop)
            updateControls()
            updateStats()
            if (scene.value && newCamera) {
              renderer.render(scene.value, newCamera)
            }
          }
          renderLoop()

          console.log('场景初始化完成')
          resolve(scene.value)
        } catch (error) {
          console.error('场景初始化失败:', error)
          reject(error)
        }
      })
    })
  }

  /**
   * 处理窗口大小变化
   */
  const handleResize = () => {
    if (!threeContainer.value || !renderer || !camera.value) return

    const width = threeContainer.value.clientWidth
    const height = threeContainer.value.clientHeight

    // 更新相机
    updateAspect(width / height)

    // 更新渲染器
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  /**
   * 重置视图
   */
  const resetView = () => {
    if (!camera.value || !controls.value) {
      console.error('重置视图失败: 相机或控制器未初始化')
      return
    }

    try {
      // 重置相机位置和朝向
      camera.value.position.set(0, 100, 200)
      camera.value.lookAt(0, 0, 0)

      // 重置控制器
      controls.value.target.set(0, 0, 0)
      controls.value.update()

      console.log('视图已重置')
    } catch (error) {
      console.error('重置视图失败:', error)
    }
  }

  /**
   * 清理资源
   */
  const dispose = () => {
    try {
      // 移除事件监听
      window.removeEventListener('resize', handleResize)

      // 清理各个模块
      disposeHelper(threeContainer.value, scene.value)
      disposeCamera()
      disposeControls()

      // 清理渲染器
      if (renderer) {
        renderer.dispose()
        renderer.forceContextLoss()
        renderer.domElement.remove()
      }

      // 清理场景
      scene.value = null

      console.log('场景资源已清理')
    } catch (error) {
      console.error('清理场景资源失败:', error)
    }
  }

  /**
   * 设置场景背景颜色
   */
  const setBackgroundColor = (color: number | string) => {
    if (!scene.value) {
      console.warn('设置背景颜色失败: 场景未初始化')
      return
    }

    try {
      scene.value.background = new THREE.Color(color)
      console.log('场景背景颜色已更新:', color)
    } catch (error) {
      console.error('设置背景颜色失败:', error)
    }
  }

  /**
   * 更新场景背景
   */
  const updateBackground = async ({ type, value }: { type: BackgroundType; value: string }) => {
    if (!scene.value || !renderer) return

    try {
      if (type === BackgroundType.Color) {
        scene.value.background = new THREE.Color(value)
      } else {
        // 加载纹理
        const textureLoader = new THREE.TextureLoader()
        
        // 确保使用完整的URL，避免缓存问题
        const imageUrl = new URL(value).toString()
        
        const texture = await new Promise<THREE.Texture>((resolve, reject) => {
          textureLoader.load(
            imageUrl,
            (loadedTexture) => {
              loadedTexture.colorSpace = THREE.SRGBColorSpace
              loadedTexture.minFilter = THREE.LinearFilter
              loadedTexture.magFilter = THREE.LinearFilter
              loadedTexture.needsUpdate = true
              resolve(loadedTexture)
            },
            (progress) => {
              console.log('背景纹理加载进度:', (progress.loaded / progress.total * 100).toFixed(1) + '%')
            },
            (error) => {
              console.error('背景纹理加载失败:', error)
              reject(error)
            }
          )
        })

        // 清除旧的背景纹理
        if (scene.value.background instanceof THREE.Texture) {
          scene.value.background.dispose()
        }

        // 设置新的背景纹理
        scene.value.background = texture

        // 强制渲染器更新
        renderer.setSize(
          renderer.domElement.clientWidth,
          renderer.domElement.clientHeight,
          false
        )
      }

      // 强制重新渲染一帧
      if (camera.value) {
        renderer.render(scene.value, camera.value)
      }

      console.log('背景更新成功:', { type, value })
    } catch (error) {
      console.error('更新场景背景失败:', error)
    }
  }

  // 生命周期钩子
  onMounted(() => window.addEventListener('resize', handleResize))
  onBeforeUnmount(() => dispose())

  return {
    threeContainer,
    scene,
    camera,
    controls,
    renderer,
    initScene,
    resetView,
    toggleGrid,
    toggleStats,
    toggleAxes,
    toggleFloor,
    updateFloorColor,
    updateBackground,
    updateLight
  }
} 