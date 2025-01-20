import { ref, reactive } from 'vue'
import type { AnimationMixer } from 'three'
import type { IModelControls } from '../types/controls'

/**
 * Three.js 模型动画管理 Hook
 */
export function useModelAnimation() {
  // 模型控制状态
  const modelControls = reactive<IModelControls>({
    scale: 1,
    isPlaying: false,
    wireframe: false,
    lights: {
      ambient: {
        enabled: true,
        intensity: 0.5,
        color: '#ffffff',
      },
      directional: {
        enabled: true,
        intensity: 0.8,
        color: '#ffffff',
        position: { x: 5, y: 5, z: 5 },
        shadow: {
          enabled: true,
          mapSize: 1024,
          bias: -0.001,
        },
      },
      point: {
        enabled: false,
        intensity: 1,
        color: '#ffffff',
        position: { x: 0, y: 5, z: 0 },
      },
      spot: {
        enabled: false,
        intensity: 1,
        color: '#ffffff',
        position: { x: 0, y: 5, z: 0 },
      },
    },
    helperConfig: {
      grid: {
        show: true,
        size: 10,
        divisions: 10,
        color: '#444444',
      },
      axes: {
        show: false,
        size: 5,
      },
      floor: {
        show: true,
        color: '#666666',
        opacity: 0.8,
      },
      stats: {
        show: false,
      },
    },
    materials: [], // 初始化空的材质列表
  })

  /**
   * 开始播放动画
   */
  const startAnimation = (mixer: AnimationMixer | null, animations: THREE.AnimationClip[]) => {
    if (!mixer || !animations.length) return

    try {
      animations.forEach((clip) => {
        const action = mixer.clipAction(clip)
        action.play()
      })
      modelControls.isPlaying = true
    } catch (error) {
      console.error('开始播放动画失败:', error)
    }
  }

  /**
   * 暂停播放动画
   */
  const pauseAnimation = (mixer: AnimationMixer | null) => {
    if (!mixer) return

    try {
      mixer.stopAllAction()
      modelControls.isPlaying = false
    } catch (error) {
      console.error('暂停播放动画失败:', error)
    }
  }

  /**
   * 重置动画
   */
  const resetAnimation = (mixer: AnimationMixer | null) => {
    if (!mixer) return

    try {
      mixer.stopAllAction()
      modelControls.isPlaying = false
    } catch (error) {
      console.error('重置动画失败:', error)
    }
  }

  /**
   * 更新动画
   */
  const updateAnimation = (mixer: AnimationMixer | null) => {
    if (mixer && modelControls.isPlaying) {
      mixer.update(0.016) // 假设 60fps
    }
  }

  return {
    modelControls,
    startAnimation,
    pauseAnimation,
    resetAnimation,
    updateAnimation,
  }
}
