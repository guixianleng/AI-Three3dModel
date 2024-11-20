import * as THREE from 'three'
import { ref, shallowRef, onMounted, onBeforeUnmount, provide } from 'vue'
import Stats from "three/examples/jsm/libs/stats.module"
import { useThreeLights, type SceneLights } from './useThreeLights'
import { useThreeCamera } from './useThreeCamera'
import type { CameraOptions } from './useThreeCamera'
import type { IModelControls } from '../types'
import { defaultLightConfig } from '../config/lightConfig'

/**
 * 场景配置选项接口
 */
interface SceneOptions {
  /** 是否显示网格 */
  showGrid?: boolean
  /** 是否显示性能监控 */
  showStats?: boolean
  /** 背景颜色 */
  backgroundColor?: number
  /** 相机配置 */
  camera?: CameraOptions
  /** 光源配置 */
  lights?: IModelControls['lights']
}

export const LIGHTS_KEY = Symbol('lights')

/**
 * Three.js 场景管理 Hook
 * @param options - 场景配置选项
 */
export function useThreeScene(options: SceneOptions = {}) {
  // 解构配置选项，设置默认值
  const {
    showGrid = true,
    showStats = true,
    backgroundColor = 0xf0f2f5,
    camera: cameraOptions,
    lights: lightConfig = defaultLightConfig  // 使用默认光源配置
  } = options

  // 场景相关的响应式引用
  const threeContainer = ref<HTMLElement>()    // 容器元素
  const scene = shallowRef<THREE.Scene | null>(null)  // 场景实例
  
  // 非响应式的场景组件
  let renderer: THREE.WebGLRenderer          // 渲染器
  let stats: Stats | null = null             // 性能监控
  let gridHelper: THREE.GridHelper | null = null  // 网格辅助线
  let lights: SceneLights | null = null      // 场景光源
  
  // 引入相关的 hooks
  const lightUtils = useThreeLights()
  const { addLightsToScene, removeLightsFromScene, updateLight } = lightUtils

  // 提供给子组件使用
  provide(LIGHTS_KEY, lightUtils)

  const { 
    camera, 
    controls, 
    createCamera, 
    createControls, 
    updateAspect,
    resetCamera,
    updateControls,
    dispose: disposeCamera 
  } = useThreeCamera(cameraOptions)

  /**
   * 初始化场景
   * @returns Promise<THREE.Scene> 初始化完成的场景实例
   */
  const initScene = async () => {
    return new Promise<THREE.Scene>((resolve, reject) => {
      requestAnimationFrame(() => {
        try {
          if (!threeContainer.value) {
            throw new Error('容器元素未找到')
          }

          // 创建场景
          const newScene = new THREE.Scene()
          newScene.background = new THREE.Color(backgroundColor)
          scene.value = newScene

          // 创建相机
          const aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight
          createCamera(aspect)

          // 创建渲染器
          renderer = new THREE.WebGLRenderer({ 
            antialias: true,  // 启用抗锯齿
            alpha: true       // 启用透明度
          })
          renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
          renderer.setPixelRatio(window.devicePixelRatio)
          threeContainer.value.appendChild(renderer.domElement)
          
          // 配置渲染器
          renderer.shadowMap.enabled = true   // 启用阴影
          renderer.shadowMap.type = THREE.PCFSoftShadowMap  // 使用PCF柔和阴影
          renderer.shadowMap.autoUpdate = true
          renderer.outputEncoding = THREE.sRGBEncoding      // 使用sRGB颜色空间
          renderer.toneMapping = THREE.ACESFilmicToneMapping  // 使用ACES电影色调映射
          renderer.toneMappingExposure = 1    // 设置色调映射曝光度

          // 创建控制器
          createControls(renderer.domElement)

          // 添加光源
          if (scene.value) {
            console.log('正在初始化场景光源...')
            lights = addLightsToScene(scene.value, lightConfig)
            if (!lights) {
              throw new Error('光源初始化失败')
            }
            console.log('场景光源初始化完成')
          }

          // 添加地板和网格
          setupFloor()

          // 性能监控
          if (showStats) {
            setupStats()
          }

          // 开始渲染循环
          const renderLoop = () => {
            requestAnimationFrame(renderLoop)
            updateControls()
            if (stats) {
              stats.update()
            }
            if (renderer && scene.value && camera.value) {
              // 更新阴影
              renderer.shadowMap.needsUpdate = true
              renderer.render(scene.value, camera.value)
            }
          }
          renderLoop()

          resolve(newScene)
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
    if (!threeContainer.value || !renderer) return
    
    const width = threeContainer.value.clientWidth
    const height = threeContainer.value.clientHeight
    
    updateAspect(width / height)
    renderer.setSize(width, height)
  }

  /**
   * 设置地板和网格
   */
  const setupFloor = () => {
    if (!scene.value) return
    
    // 创建地板
    const floorGeometry = new THREE.PlaneGeometry(2000, 2000)
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xcccccc,
      roughness: 0.8,
      metalness: 0.2
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = 0
    
    // 确保地板接收阴影
    floor.receiveShadow = true
    scene.value.add(floor)

    // 添加网格辅助线
    if (showGrid) {
      gridHelper = new THREE.GridHelper(2000, 100, 0x888888, 0x888888)
      gridHelper.position.y = 0.1
      scene.value.add(gridHelper)
    }
  }

  /**
   * 设置性能监控器
   */
  const setupStats = () => {
    if (!threeContainer.value) return
    stats = new Stats()
    stats.dom.style.cssText = 'position: absolute; top: 0; left: 0;'
    threeContainer.value.appendChild(stats.dom)
  }

  /**
   * 切换网格显示状态
   * @param show - 是否显示网格
   */
  const toggleGrid = (show: boolean) => {
    if (!scene.value || !gridHelper) return
    
    if (show && !scene.value.children.includes(gridHelper)) {
      scene.value.add(gridHelper)
    } else if (!show && scene.value.children.includes(gridHelper)) {
      scene.value.remove(gridHelper)
    }
  }

  /**
   * 切换性能监控显示状态
   * @param show - 是否显示性能监控
   */
  const toggleStats = (show: boolean) => {
    if (!threeContainer.value) return

    if (show && !stats) {
      setupStats()
    } else if (!show && stats) {
      threeContainer.value.removeChild(stats.dom)
      stats = null
    }
  }

  // 生命周期钩子
  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    // 清理资源
    window.removeEventListener('resize', handleResize)
    if (threeContainer.value && stats) {
      threeContainer.value.removeChild(stats.dom)
    }
    if (scene.value && lights) {
      removeLightsFromScene(scene.value, lights)
    }
    disposeCamera()
    if (renderer) {
      renderer.dispose()
    }
    scene.value = null
  })

  return {
    threeContainer,
    scene,
    camera,
    controls,
    renderer,
    initScene,
    resetCamera,
    toggleGrid,
    toggleStats,
    updateLight
  }
} 