import * as THREE from 'three'
import { shallowRef } from 'vue'
import type { ICameraOptions } from '../types/camera'

/**
 * Three.js 相机管理 Hook
 */
export function useThreeCamera(options: ICameraOptions = {}) {
  const {
    fov = 75,
    near = 0.1,
    far = 1000,
    position = { x: 0, y: 100, z: 200 }
  } = options

  const camera = shallowRef<THREE.PerspectiveCamera>()

  /**
   * 创建相机
   */
  const createCamera = (aspect: number) => {
    try {
      const newCamera = new THREE.PerspectiveCamera(fov, aspect, near, far)
      newCamera.position.set(position.x, position.y, position.z)
      camera.value = newCamera
      return newCamera
    } catch (error) {
      console.error('创建相机失败:', error)
      return null
    }
  }

  /**
   * 更新相机宽高比
   */
  const updateAspect = (aspect: number) => {
    if (!camera.value) return
    camera.value.aspect = aspect
    camera.value.updateProjectionMatrix()
  }

  /**
   * 销毁相机
   */
  const dispose = () => {
    camera.value = null
  }

  return {
    camera,
    createCamera,
    updateAspect,
    dispose
  }
} 