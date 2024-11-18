import { reactive } from 'vue'
import * as THREE from 'three'
import type { IModelControls } from '../types'

/**
 * 3D模型动画控制 Hook
 * @returns {Object} 动画控制相关的状态和方法
 */
export function useModelAnimation() {
  // 模型控制状态
  const modelControls: IModelControls = reactive({
    scale: 1,
    isPlaying: false,
    wireframe: false
  })

  // 当前动画动作
  let currentAction: THREE.AnimationAction | null = null
  // 上次暂停时的时间点
  let lastTime = 0
  // 动画时钟
  let clock = new THREE.Clock()

  /**
   * 开始/继续播放动画
   * @param mixer - Three.js 动画混合器
   * @param animations - 动画动作数组
   */
  const startAnimation = (mixer: THREE.AnimationMixer, animations: THREE.AnimationAction[]) => {
    if (!mixer || !animations.length) return
    
    modelControls.isPlaying = true
    if (!currentAction) {
      // 首次播放
      currentAction = animations[0]
      clock.start()
      currentAction.play()
    } else {
      // 从暂停点继续播放
      clock.start()
      console.log('继续动画的帧数', lastTime)
      currentAction.paused = false
      currentAction.time = lastTime
      mixer.setTime(lastTime)
      currentAction.play()
    }
  }

  /**
   * 暂停动画
   * @param mixer - Three.js 动画混合器
   */
  const pauseAnimation = (mixer: THREE.AnimationMixer) => {
    if (!currentAction || !mixer) return
    
    modelControls.isPlaying = false
    lastTime = mixer.time  // 记录当前时间点
    currentAction.paused = true
    console.log('暂定的帧数：', lastTime)
    clock.stop()
  }

  /**
   * 重置动画到初始状态
   * @param mixer - Three.js 动画混合器
   */
  const resetAnimation = (mixer: THREE.AnimationMixer) => {
    if (!currentAction || !mixer) return
    
    modelControls.isPlaying = false
    lastTime = 0
    clock.stop()
    currentAction.stop()
    currentAction.reset()
    mixer.setTime(0)
    currentAction = null
  }

  /**
   * 更新动画
   * @param mixer - Three.js 动画混合器
   * @description 在动画循环中调用此函数以更新动画状态
   */
  const updateAnimation = (mixer: THREE.AnimationMixer) => {
    if (mixer && modelControls.isPlaying) {
      const delta = clock.getDelta()
      mixer.update(delta)
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