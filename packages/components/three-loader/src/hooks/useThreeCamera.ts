import * as THREE from 'three'
import { ref, shallowRef } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export interface CameraOptions {
  /** 视野角度 */
  fov?: number
  /** 近裁剪面 */
  near?: number
  /** 远裁剪面 */
  far?: number
  /** 初始位置 */
  position?: {
    x: number
    y: number
    z: number
  }
  /** 控制器配置 */
  controls?: {
    enableDamping?: boolean
    dampingFactor?: number
  }
}

export function useThreeCamera(options: CameraOptions = {}) {
  const {
    fov = 75,
    near = 0.1,
    far = 1000,
    position = { x: 0, y: 100, z: 200 },
    controls: controlsOptions = {
      enableDamping: true,
      dampingFactor: 0.05
    }
  } = options

  const camera = shallowRef<THREE.PerspectiveCamera>()
  const controls = shallowRef<OrbitControls>()

  /**
   * 创建相机
   * @param aspect - 相机视角宽高比
   */
  const createCamera = (aspect: number) => {
    camera.value = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.value.position.set(position.x, position.y, position.z)
    return camera.value
  }

  /**
   * 创建相机控制器
   * @param domElement - 渲染器的 DOM 元素
   */
  const createControls = (domElement: HTMLElement) => {
    if (!camera.value) return

    controls.value = new OrbitControls(camera.value, domElement)
    controls.value.enableDamping = controlsOptions.enableDamping
    controls.value.dampingFactor = controlsOptions.dampingFactor

    return controls.value
  }

  /**
   * 更新相机宽高比
   * @param aspect - 新的宽高比
   */
  const updateAspect = (aspect: number) => {
    if (!camera.value) return
    
    camera.value.aspect = aspect
    camera.value.updateProjectionMatrix()
  }

  /**
   * 重置相机位置和视角
   */
  const resetCamera = () => {
    if (!camera.value || !controls.value) {
      console.warn('相机或控制器未初始化')
      return
    }
    
    try {
      camera.value.position.set(position.x, position.y, position.z)
      camera.value.lookAt(0, 0, 0)
      controls.value.target.set(0, 0, 0)
      controls.value.update()
    } catch (error) {
      console.error('重置相机失败:', error)
    }
  }

  /**
   * 更新控制器
   */
  const updateControls = () => {
    if (controls.value?.enableDamping) {
      controls.value.update()
    }
  }

  /**
   * 销毁相机和控制器
   */
  const dispose = () => {
    if (controls.value) {
      controls.value.dispose()
    }
    camera.value = null
    controls.value = null
  }

  return {
    camera,
    controls,
    createCamera,
    createControls,
    updateAspect,
    resetCamera,
    updateControls,
    dispose
  }
} 