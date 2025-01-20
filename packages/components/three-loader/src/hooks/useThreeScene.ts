import * as THREE from 'three'
import { ref, shallowRef, onMounted, onBeforeUnmount, provide, watch } from 'vue'
import { useThreeLights } from './useThreeLights'
import { useThreeCamera } from './useThreeCamera'
import { useThreeControls } from './useThreeControls'
import { useThreeHelper } from './useThreeHelper'
import { useThreeModel } from './useThreeModel'
import { useModelAnimation } from './useModelAnimation'
import { useThreeMaterials } from './useThreeMaterials'

import type { ISceneOptions } from '../types/scene'
import { defaultModelConfig, BackgroundType } from '../config/modelConfig'

export const LIGHTS_KEY = Symbol('lights')

/**
 * Three.js 场景管理 Hook
 */
export function useThreeScene(options: ISceneOptions = {}) {
  const {
    camera: cameraOptions = defaultModelConfig.camera,
    lights: lightConfig = defaultModelConfig.lights,
    controls: controlsOptions = defaultModelConfig.controls,
    helper: helperOptions = defaultModelConfig.helperConfig,
  } = options

  // 场景相关引用
  const threeContainer = ref<HTMLElement>()
  const scene = shallowRef<THREE.Scene | null>(null)
  let renderer: THREE.WebGLRenderer

  // 引入相关的 hooks
  const lightUtils = useThreeLights()
  const { addLightsToScene, updateLight } = lightUtils
  provide(LIGHTS_KEY, lightUtils)

  const {
    camera,
    createCamera,
    setCamera,
    updateAspect,
    dispose: disposeCamera,
  } = useThreeCamera(cameraOptions)

  const {
    controls,
    createControls,
    updateControls,
    updateControlsOptions: updateControlsConfig,
    dispose: disposeControls,
  } = useThreeControls(camera.value, controlsOptions)

  const {
    createFloor,
    createStats,
    toggleGrid,
    updateGridColor,
    toggleStats,
    toggleAxes,
    toggleFloor,
    updateStats,
    updateFloorColor,
    updateFloorOpacity,
    dispose: disposeHelper,
  } = useThreeHelper(helperOptions)

  // 加载模型管理
  const {
    mixer,
    animations,
    model,
    loadModel,
    loading,
    loadingProgress,
    dispose: disposeModel,
    updatePosition,
    updateScale,
    updateRotation,
    updateMaterials: updateModelMaterials,
  } = useThreeModel()

  // 材质管理
  const {
    materials,
    materialList,
    currentMaterial,
    extractMaterialsFromModel,
    updateMaterialProperty,
    convertMaterialType,
    selectMaterial,
  } = useThreeMaterials()

  // 动画管理
  const { modelControls, startAnimation, pauseAnimation, resetAnimation, updateAnimation } =
    useModelAnimation()

  // 更新模型控制状态中的材质列表
  watch(materialList, (newList) => {
    if (modelControls) {
      modelControls.materials = newList
    }
  })

  // 渲染循环ID
  let animationFrameId: number | null = null

  /**
   * 创建渲染器
   */
  const createRenderer = (container: HTMLElement) => {
    try {
      const newRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: 'high-performance',
      })
      newRenderer.setSize(container.clientWidth, container.clientHeight)
      newRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // 限制像素比以优化性能
      newRenderer.shadowMap.enabled = true
      // newRenderer.shadowMap.type = THREE.PCFSoftShadowMap
      // newRenderer.outputEncoding = THREE.sRGBEncoding
      // newRenderer.toneMapping = THREE.ACESFilmicToneMapping
      // newRenderer.setClearAlpha(0)
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
  const initScene = async (
    modelUrl = 'https://threejs.org/examples/models/collada/abb_irb52_7_120.dae'
  ) => {
    try {
      console.log('开始初始化场景...')
      if (!threeContainer.value) {
        throw new Error('容器元素未找到')
      }

      // 创建场景
      scene.value = new THREE.Scene()

      // 设置 RGBA 背景色
      const backgroundColor = new THREE.Color()
      backgroundColor.setStyle(defaultModelConfig.background.color)

      // 不设置场景背景，而是使用渲染器的 clearColor
      scene.value.background = null

      // 确保渲染器支持透明背景
      renderer = createRenderer(threeContainer.value)
      if (!renderer) throw new Error('渲染器创建失败')

      // 设置背景色和透明度
      renderer.setClearColor(backgroundColor, defaultModelConfig.background.opacity)

      // 创建相机
      const aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight
      const newCamera = createCamera(aspect)
      if (!newCamera) throw new Error('相机创建失败')

      // 设置相机初始位置
      const { initial: initialPos, target } = defaultModelConfig.camera.position
      newCamera.position.set(initialPos.x, initialPos.y, initialPos.z)
      newCamera.lookAt(target.x, target.y, target.z)
      setCamera(newCamera)

      // 等待相机设置完成后再创建控制器
      await Promise.resolve() // 确保相机状态已更新

      // 创建控制器并配置
      const newControls = createControls(renderer.domElement)
      if (!newControls) throw new Error('控制器创建失败')

      // 应用控制器配置
      Object.assign(newControls, controlsOptions)
      newControls.update()

      // 添加光源
      const lights = addLightsToScene(scene.value, lightConfig)
      if (!lights) throw new Error('光源初始化失败')

      // 添加辅助工具
      createFloor(scene.value)
      createStats(threeContainer.value)

      // 加载模型
      const { model: loadedModel } = await loadModel(modelUrl, scene.value)
      if (!loadedModel) throw new Error('模型加载失败')

      // 添加模型到场景
      scene.value.add(loadedModel)

      // 提取模型材质
      console.log('正在提取模型材质...')
      extractMaterialsFromModel(loadedModel)

      // 启动渲染循环
      startRenderLoop()
      
      console.log('场景初始化完成')
    } catch (error) {
      stopRenderLoop()
      loading.value = false
      console.error('场景初始化失败:', error)
      throw error
    }
  }

  /**
   * 启动渲染循环
   */
  const startRenderLoop = () => {
    // 如果已经在运行，则不重复启动
    if (animationFrameId !== null) return

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      if (controls.value) {
        controls.value.update()
      }

      updateAnimation(mixer.value)

      if (scene.value && camera.value) {
        renderer.render(scene.value, camera.value)
      }

      updateStats()
    }

    animate()
  }

  /**
   * 停止渲染循环
   */
  const stopRenderLoop = () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
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
      disposeModel()

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
   * 更新场景背景
   */
  const updateBackground = async ({
    type,
    value,
    opacity,
  }: {
    type: BackgroundType
    value: string
    opacity?: number
  }) => {
    if (!scene.value) return

    try {
      if (type === BackgroundType.Color) {
        const color = new THREE.Color()
        color.setStyle(value)

        // 设置场景背景为 null，这样才能看到透明效果
        scene.value.background = null

        // 使用 setClearColor 来设置背景色和透明度
        const finalOpacity = opacity ?? defaultModelConfig.background.opacity
        renderer.setClearColor(color, finalOpacity)

        console.log('背景更新:', {
          color: value,
          opacity: finalOpacity,
          actualAlpha: renderer.getClearAlpha(),
        })
      } else {
        // 加载纹理
        const textureLoader = new THREE.TextureLoader()

        // 确保使用完整的URL，避免缓存问题
        const imageUrl = new URL(value).toString()

        const texture = await new Promise<THREE.Texture>((resolve, reject) => {
          textureLoader.load(
            imageUrl,
            loadedTexture => {
              loadedTexture.colorSpace = THREE.SRGBColorSpace
              loadedTexture.minFilter = THREE.LinearFilter
              loadedTexture.magFilter = THREE.LinearFilter
              loadedTexture.needsUpdate = true
              resolve(loadedTexture)
            },
            progress => {
              console.log(
                '背景纹理加载进度:',
                ((progress.loaded / progress.total) * 100).toFixed(1) + '%'
              )
            },
            error => {
              console.error('背景纹理加载失败:', error)
              reject(error)
            }
          )
        })

        // 清除旧的背景纹理
        if (scene.value.background instanceof THREE.Texture) {
          scene.value.background.dispose()
        }

        // 设新的背景纹理
        scene.value.background = texture

        // 强制渲染器更新
        renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight, false)
      }

      // 强制重新渲染一帧
      if (camera.value) {
        renderer.render(scene.value, camera.value)
      }
    } catch (error) {
      console.error('更新场景背景失败:', error)
    }
  }

  /**
   * 更新材质
   */
  const handleMaterialUpdate = (options: IMaterialUpdateOptions) => {
    try {
      const { name, property, value } = options
      
      // 处理材质选择
      if (property === 'select') {
        const material = materials.value.get(name)
        if (material) {
          selectMaterial(name)
          console.log('选中材质:', name)
          // 强制重新渲染一帧以显示高亮效果
          if (scene.value && camera.value) {
            renderer.render(scene.value, camera.value)
          }
        }
        return
      }

      // 如果是类型变更，需要转换材质
      if (property === 'type') {
        convertMaterialType(name, value)
        // 如果当前有选中的材质，重新应用高亮效果
        if (currentMaterial.value?.name) {
          selectMaterial(currentMaterial.value.name)
          // 强制重新渲染一帧以显示高亮效果
          if (scene.value && camera.value) {
            renderer.render(scene.value, camera.value)
          }
        }
      } else {
        // 更新其他材质属性
        updateMaterialProperty(name, property, value)
      }

      // 通知模型更新材质
      updateModelMaterials(options)
      
      // 确保所有材质更新后重新渲染一帧
      if (scene.value && camera.value) {
        renderer.render(scene.value, camera.value)
      }
    } catch (error) {
      console.error('更新材质失败:', error)
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
    mixer,
    animations,
    model,
    loading,
    loadingProgress,
    initScene,
    modelControls,
    resetView,
    startAnimation: () => startAnimation(mixer.value, animations.value),
    pauseAnimation: () => pauseAnimation(mixer.value),
    resetAnimation: () => resetAnimation(mixer.value),
    toggleGrid: (show: boolean) => toggleGrid(scene.value, show),
    updateGridColor: (color: string) => updateGridColor(scene.value, color),
    toggleStats: (show: boolean) => toggleStats(threeContainer.value, show),
    toggleAxes: (show: boolean) => toggleAxes(scene.value, show),
    toggleFloor: (show: boolean) => toggleFloor(scene.value, show),
    updatePosition,
    updateScale,
    updateRotation,
    updateMaterials: handleMaterialUpdate,
    updateFloorColor,
    updateBackground,
    updateFloorOpacity,
    updateLight,
    updateControlsOptions: updateControlsConfig,
  }
}
