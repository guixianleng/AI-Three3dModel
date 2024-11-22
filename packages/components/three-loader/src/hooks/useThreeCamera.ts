import * as THREE from 'three'
import { shallowRef } from 'vue'
import type { ICameraOptions } from '../types/camera'

/**
 * Three.js 相机管理 Hook
 */
export function useThreeCamera(options: ICameraOptions = {}) {
  const {fov,near,far,position} = options

  // 初始化时就创建相机
  const camera = shallowRef<THREE.PerspectiveCamera>(
    new THREE.PerspectiveCamera(fov, 1, near, far)
  )

  // 设置初始位置
  camera.value.position.set(position.x, position.y, position.z)

  /**
   * 创建相机
   */
  const createCamera = (aspect: number) => {
    try {
      // 只更新相机的宽高比，而不是重新创建相机
      camera.value.aspect = aspect
      camera.value.updateProjectionMatrix()
      return camera.value
    } catch (error) {
      console.error('更新相机失败:', error)
      return null
    }
  }

  /**
   * 设置相机
   */
  const setCamera = (newCamera: THREE.PerspectiveCamera) => {
    camera.value = newCamera
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
    setCamera,
    updateAspect,
    dispose
  }
} 