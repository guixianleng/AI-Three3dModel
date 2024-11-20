import { reactive } from 'vue'
import * as THREE from 'three'
import type { IModelControls } from '../types/controls'
import { defaultModelConfig } from '../config/modelConfig'

/**
 * 3D模型动画控制 Hook
 */
export function useModelAnimation() {
  // 使用默认配置初始化模型控制状态
  const modelControls: IModelControls = reactive({
    ...defaultModelConfig
  })

  // 动画相关变量
  let currentAction: THREE.AnimationAction | null = null
  const clock = new THREE.Clock()
  let lastTime = 0

  /**
   * 开始/继续播放动画
   */
  const startAnimation = (mixer: THREE.AnimationMixer, animations: THREE.AnimationAction[]) => {
    if (!mixer || !animations.length) {
      console.warn('动画播放失败: 未找到可用的动画')
      return
    }

    try {
      modelControls.isPlaying = true
      if (!currentAction) {
        // 首次播放
        currentAction = animations[0]
        clock.start()
        currentAction.play()
        console.log('开始播放动画')
      } else {
        // 继续播放
        currentAction.paused = false
        currentAction.time = lastTime
        mixer.setTime(lastTime)
        currentAction.play()
        clock.start()
        console.log('继续播放动画, 时间点:', lastTime)
      }
    } catch (error) {
      console.error('播放动画失败:', error)
      modelControls.isPlaying = false
    }
  }

  /**
   * 暂停动画
   */
  const pauseAnimation = (mixer: THREE.AnimationMixer) => {
    if (!currentAction || !mixer) {
      console.warn('暂停动画失败: 当前没有正在播放的动画')
      return
    }

    try {
      lastTime = mixer.time
      currentAction.paused = true
      clock.stop()
      modelControls.isPlaying = false
      console.log('动画已暂停, 时间点:', lastTime)
    } catch (error) {
      console.error('暂停动画失败:', error)
    }
  }

  /**
   * 重置动画
   */
  const resetAnimation = (mixer: THREE.AnimationMixer) => {
    if (!currentAction || !mixer) {
      console.warn('重置动画失败: 没有可重置的动画')
      return
    }

    try {
      // 停止并重置动画
      currentAction.stop()
      currentAction.reset()
      mixer.setTime(0)
      
      // 重置状态
      currentAction = null
      lastTime = 0
      clock.stop()
      modelControls.isPlaying = false
      
      console.log('动画已重置')
    } catch (error) {
      console.error('重置动画失败:', error)
    }
  }

  /**
   * 更新动画
   */
  const updateAnimation = (mixer: THREE.AnimationMixer) => {
    if (mixer && modelControls.isPlaying) {
      try {
        mixer.update(clock.getDelta())
      } catch (error) {
        console.error('更新动画失败:', error)
        pauseAnimation(mixer)
      }
    }
  }

  return {
    modelControls,
    startAnimation,
    pauseAnimation,
    resetAnimation,
    updateAnimation
  }
} 