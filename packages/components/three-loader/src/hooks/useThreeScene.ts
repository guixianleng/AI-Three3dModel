import * as THREE from 'three'
import { ref, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from "three/examples/jsm/libs/stats.module"

interface SceneOptions {
  showGrid?: boolean
  showStats?: boolean
  backgroundColor?: number
}

export function useThreeScene(options: SceneOptions = {}) {
  const {
    showGrid = true,
    showStats = true,
    backgroundColor = 0xf0f2f5
  } = options

  const threeContainer = ref<HTMLElement>()
  const scene = shallowRef<THREE.Scene | null>(null)
  let camera: THREE.PerspectiveCamera
  let renderer: THREE.WebGLRenderer
  let orbitControls: OrbitControls
  let stats: Stats | null = null
  let gridHelper: THREE.GridHelper | null = null

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
          camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
          camera.position.set(0, 100, 200)

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
          orbitControls = new OrbitControls(camera, renderer.domElement)
          orbitControls.enableDamping = true
          orbitControls.dampingFactor = 0.05

          // 添加光源
          setupLights()
          console.log('光源设置完成')

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
            if (orbitControls) {
              orbitControls.update()
            }
            if (stats) {
              stats.update()
            }
            if (renderer && scene.value && camera) {
              renderer.render(scene.value, camera)
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

  const setupLights = () => {
    if (!scene.value) return
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.value.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 1)
    mainLight.position.set(50, 100, 50)
    mainLight.castShadow = true
    mainLight.shadow.mapSize.width = 2048
    mainLight.shadow.mapSize.height = 2048
    mainLight.shadow.camera.near = 0.5
    mainLight.shadow.camera.far = 500
    mainLight.shadow.camera.left = -100
    mainLight.shadow.camera.right = 100
    mainLight.shadow.camera.top = 100
    mainLight.shadow.camera.bottom = -100
    mainLight.shadow.bias = -0.0001
    scene.value.add(mainLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
    fillLight.position.set(-50, 100, -50)
    scene.value.add(fillLight)

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.2)
    hemiLight.position.set(0, 200, 0)
    scene.value.add(hemiLight)
  }

  const setupFloor = () => {
    if (!scene.value) return
    const floorGeometry = new THREE.PlaneGeometry(1000, 1000)
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xcccccc,
      roughness: 0.8,
      metalness: 0.2
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = 0
    floor.receiveShadow = true
    scene.value.add(floor)

    if (showGrid) {
      gridHelper = new THREE.GridHelper(1000, 50, 0x888888, 0x888888)
      gridHelper.position.y = 0.1
      scene.value.add(gridHelper)
    }
  }

  const setupStats = () => {
    if (!threeContainer.value) return
    stats = new Stats()
    stats.dom.style.cssText = 'position: absolute; top: 0; left: 0;'
    threeContainer.value.appendChild(stats.dom)
  }

  const handleResize = () => {
    if (!threeContainer.value || !camera || !renderer) return
    
    const width = threeContainer.value.clientWidth
    const height = threeContainer.value.clientHeight
    
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  const resetCamera = () => {
    if (!camera || !orbitControls) return
    camera.position.set(0, 100, 200)
    camera.lookAt(0, 0, 0)
    orbitControls.reset()
  }

  const toggleGrid = (show: boolean) => {
    if (!scene.value || !gridHelper) return
    
    if (show && !scene.value.children.includes(gridHelper)) {
      scene.value.add(gridHelper)
    } else if (!show && scene.value.children.includes(gridHelper)) {
      scene.value.remove(gridHelper)
    }
  }

  const toggleStats = (show: boolean) => {
    if (!threeContainer.value) return

    if (show && !stats) {
      setupStats()
    } else if (!show && stats) {
      threeContainer.value.removeChild(stats.dom)
      stats = null
    }
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    if (threeContainer.value && stats) {
      threeContainer.value.removeChild(stats.dom)
    }
    if (renderer) {
      renderer.dispose()
    }
  })

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