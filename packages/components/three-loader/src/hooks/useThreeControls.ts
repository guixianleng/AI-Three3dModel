import * as THREE from 'three'
import { shallowRef } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import type { IControlsOptions } from '../types/controls'

/**
 * Three.js 场景控制器管理 Hook
 */
export function useThreeControls(camera: THREE.Camera | undefined, options: IControlsOptions = {}) {
  const {
    enableDamping = true,
    dampingFactor = 0.05,
    autoRotate = false,
    autoRotateSpeed = 2.0,
    minPolarAngle = 0,
    maxPolarAngle = Math.PI,
    minDistance = 1,
    maxDistance = 1000,
  } = options

  const controls = shallowRef<OrbitControls | null>(null)

  /**
   * 创建控制器
   */
  const createControls = (domElement: HTMLElement) => {
    if (!camera) {
      console.error('相机未初始化，无法创建控制器')
      return null
    }

    try {
      const newControls = new OrbitControls(camera, domElement)

      // 配置控制器
      Object.assign(newControls, {
        enableDamping,
        dampingFactor,
        autoRotate,
        autoRotateSpeed,
        minPolarAngle,
        maxPolarAngle,
        minDistance,
        maxDistance,
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
    createControls,
    updateControls,
    dispose,
  }
}
