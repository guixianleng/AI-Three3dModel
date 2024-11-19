import * as THREE from 'three'
import { ref, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from "three/examples/jsm/libs/stats.module"
import { useThreeLights, type SceneLights } from './useThreeLights'

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
}

/**
 * Three.js 场景管理 Hook
 */
export function useThreeScene(options: SceneOptions = {}) {
  // 解构配置选项，设置默认值
  const {
    showGrid = true,
    showStats = true,
    backgroundColor = 0xf0f2f5
  } = options

  // 场景相关的响应式引用
  const threeContainer = ref<HTMLElement>() // 容器元素
  const scene = shallowRef<THREE.Scene | null>(null) // 场景实例
  
  // 将 camera 和 orbitControls 改为响应式引用
  const camera = shallowRef<THREE.PerspectiveCamera>()
  const orbitControls = shallowRef<OrbitControls>()
  
  // 非响应式的场景组件
  let renderer: THREE.WebGLRenderer          // 渲染器
  let stats: Stats | null = null             // 性能监控
  let gridHelper: THREE.GridHelper | null = null // 网格辅助线
  let lights: SceneLights | null = null      // 场景光源
  
  // 引入光源管理 hook
  const { addLightsToScene, removeLightsFromScene } = useThreeLights()

  /**
   * 初始化场景
   * @returns {Promise<THREE.Scene>} 初始化完成的场景实例
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
          console.log('场景创建成功')

          // 创建相机
          const aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight
          camera.value = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
          camera.value.position.set(0, 100, 200)

          // 创建渲染器
          renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true
          })
          renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
          renderer.setPixelRatio(window.devicePixelRatio)
          threeContainer.value.appendChild(renderer.domElement)
          
          renderer.shadowMap.enabled = true
          renderer.shadowMap.type = THREE.PCFSoftShadowMap
          renderer.outputEncoding = THREE.sRGBEncoding
          renderer.toneMapping = THREE.ACESFilmicToneMapping
          renderer.toneMappingExposure = 1

          // 创建控制器
          if (camera.value && renderer) {
            orbitControls.value = new OrbitControls(camera.value, renderer.domElement)
            orbitControls.value.enableDamping = true
            orbitControls.value.dampingFactor = 0.05
          }

          // 添加光源
          if (scene.value) {
            lights = addLightsToScene(scene.value)
            console.log('光源设置完成')
          }

          // 添加地板和网格
          setupFloor()
          console.log('地板和网格设置完成')

          // 性能监控
          if (showStats) {
            setupStats()
          }

          // 开始渲染循环
          const renderLoop = () => {
            requestAnimationFrame(renderLoop)
            if (orbitControls.value) {
              orbitControls.value.update()
            }
            if (stats) {
              stats.update()
            }
            if (renderer && scene.value && camera.value) {
              renderer.render(scene.value, camera.value)
            }
          }
          renderLoop()

          console.log('场景初始化完成')
          resolve(newScene)
        } catch (error) {
          console.error('场景初始化失败:', error)
          reject(error)
        }
      })
    })
  }

  /**
   * 设置地板和网格
   */
  const setupFloor = () => {
    if (!scene.value) return
    
    // 创建地板
    const floorGeometry = new THREE.PlaneGeometry(1000, 1000)
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xcccccc,
      roughness: 0.8,
      metalness: 0.2
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2 // 使地板水平
    floor.position.y = 0
    floor.receiveShadow = true
    scene.value.add(floor)

    // 添加网格辅助线
    if (showGrid) {
      gridHelper = new THREE.GridHelper(1000, 50, 0x888888, 0x888888)
      gridHelper.position.y = 0.1 // 略微抬高网格，防止与地板重叠
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
   * 处理窗口大小变化
   */
  const handleResize = () => {
    if (!threeContainer.value || !camera.value || !renderer) return
    
    const width = threeContainer.value.clientWidth
    const height = threeContainer.value.clientHeight
    
    camera.value.aspect = width / height
    camera.value.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  /**
   * 重置相机位置和视角
   */
  const resetCamera = () => {
    if (!camera.value || !orbitControls.value) {
      console.warn('相机或控制器未初始化')
      return
    }
    
    try {
      camera.value.position.set(0, 100, 200)
      camera.value.lookAt(0, 0, 0)
      orbitControls.value.target.set(0, 0, 0)
      orbitControls.value.update()
    } catch (error) {
      console.error('重置相机失败:', error)
    }
  }

  /**
   * 切换网格显示状态
   * @param {boolean} show - 是否显示网格
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
   * @param {boolean} show - 是否显示性能监控
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
    window.removeEventListener('resize', handleResize)
    if (threeContainer.value && stats) {
      threeContainer.value.removeChild(stats.dom)
    }
    if (scene.value && lights) {
      removeLightsFromScene(scene.value, lights)
    }
    if (orbitControls.value) {
      orbitControls.value.dispose()
    }
    if (renderer) {
      renderer.dispose()
    }
    // 清空引用
    camera.value = null
    orbitControls.value = null
    scene.value = null
  })

  // 返回场景管理相关的方法和属性
  return {
    threeContainer,
    scene,
    camera,
    renderer,
    orbitControls,
    resetCamera,
    initScene,
    toggleGrid,
    toggleStats
  }
} 