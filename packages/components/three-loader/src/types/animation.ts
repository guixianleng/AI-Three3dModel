import type * as THREE from 'three'

/**
 * 模型加载结果接口
 */
export interface ModelLoadResult {
  /** 加载的模型对象 */
  model: THREE.Group
  /** 动画混合器 */
  mixer: THREE.AnimationMixer
  /** 动画动作数组 */
  animations: THREE.AnimationAction[]
} 