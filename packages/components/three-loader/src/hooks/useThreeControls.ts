import * as THREE from 'three'
import { ref, shallowRef } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import type { IControlsOptions } from '../types/controls'

/**
 * Three.js 场景控制器管理 Hook
 */
export function useThreeControls(initialCamera?: THREE.Camera, options: IControlsOptions = {}) {
  const {
    enableDamping = true,
    dampingFactor = 0.05,
    autoRotate = false,
    autoRotateSpeed = 2.0,
    minPolarAngle = 0,
    maxPolarAngle = Math.PI,
    minDistance = 1,
    maxDistance = 1000
  } = options

  const controls = shallowRef<OrbitControls | null>(null)
  const camera = ref<THREE.Camera | undefined>(initialCamera)

  /**
   * 设置相机
   */
  const setCamera = (newCamera: THREE.Camera) => {
    camera.value = newCamera
  }

  /**
   * 创建控制器
   */
  const createControls = (domElement: HTMLElement) => {
    if (!camera.value) {
      console.error('相机未初始化，无法创建控制器')
      return null
    }

    try {
      const newControls = new OrbitControls(camera.value, domElement)

      // 配置控制器
      Object.assign(newControls, {
        enableDamping,
        dampingFactor,
        autoRotate,
        autoRotateSpeed,
        minPolarAngle,
        maxPolarAngle,
        minDistance,
        maxDistance
      })

      controls.value = newControls
      return newControls
    } catch (error) {
      console.error('创建控制器失败:', error)
      return null
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
   * 销毁控制器
   */
  const dispose = () => {
    if (controls.value) {
      controls.value.dispose()
      controls.value = null
    }
  }

  return {
    controls,
    setCamera,
    createControls,
    updateControls,
    dispose
  }
} 