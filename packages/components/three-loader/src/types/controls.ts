import type { SceneLightsConfig } from './lights'
import type { IHelperOptions } from './scene'
import type { IMaterialOptions } from './materials'

/**
 * 模型控制状态接口
 */
export interface IModelControls {
  /** 模型缩放 */
  scale: number
  /** 是否正在播放动画 */
  isPlaying: boolean
  /** 是否显示线框 */
  wireframe: boolean
  /** 光源配置 */
  lights: SceneLightsConfig
  /** 辅助工具配置 */
  helperConfig: IHelperOptions
  /** 材质列表 */
  materials: IMaterialOptions[]
}

/**
 * 控制器配置选项接口
 */
export interface IControlsOptions {
  /** 是否启用阻尼 */
  enableDamping?: boolean
  /** 阻尼系数 */
  dampingFactor?: number
  /** 自动旋转 */
  autoRotate?: boolean
  /** 自动旋转速度 */
  autoRotateSpeed?: number
  /** 最小极角 */
  minPolarAngle?: number
  /** 最大极角 */
  maxPolarAngle?: number
  /** 最小距离 */
  minDistance?: number
  /** 最大距离 */
  maxDistance?: number
}
