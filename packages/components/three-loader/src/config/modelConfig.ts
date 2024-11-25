import type { IPosition } from '../types/positions'
import { defaultLightConfig, type SceneLightsConfig } from './lightConfig'
import { defaultHelperConfig } from './helperConfig'
import type { IHelperOptions } from '../types/scene'
import type { IControlsOptions } from '../types/controls'
import { defaultCameraConfig, type CameraConfig } from './cameraConfig'

/**
 * 背景类型枚举
 */
export enum BackgroundType {
  /** 纯色背景 */
  Color = 'color',
  /** 图片背景 */
  Image = 'image',
}

/**
 * 背景配置接口
 */
interface BackgroundConfig {
  /** 背景类型 */
  type: BackgroundType
  /** 背景颜色 (支持 rgba) */
  color: string
  /** 背景透明度 */
  opacity: number
  /** 背景图片URL */
  image: string
}

/**
 * 模型配置接口
 */
export interface ModelConfig {
  /** 动画播放状态 */
  isPlaying: boolean
  /** 模型位置 */
  position: IPosition
  /** 模型旋转角度 */
  rotation: IPosition
  /** 背景配置 */
  background: BackgroundConfig
  /** 光源配置 */
  lights: SceneLightsConfig
  /** 辅助工具配置 */
  helperConfig: IHelperOptions
  /** 控制器配置 */
  controls: IControlsOptions
  /** 相机配置 */
  camera: CameraConfig
}

/**
 * 默认模型配置
 */
export const defaultModelConfig: ModelConfig = {
  isPlaying: false,
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  background: {
    type: BackgroundType.Color,
    color: 'rgba(159, 164, 170, 0.5)',
    opacity: 0.5,
    image: '',
  },
  lights: defaultLightConfig,
  helperConfig: defaultHelperConfig,
  controls: {
    enableDamping: true, // 启用阻尼效果
    dampingFactor: 0.05, // 阻尼系数
    enableZoom: true, // 启用缩放
    minDistance: 100, // 最小缩放距离
    maxDistance: 1000, // 最大缩放距离
    enablePan: true, // 启用平移
    autoRotate: false, // 自动旋转
    autoRotateSpeed: 2.0, // 自动旋转速度
  },
  camera: defaultCameraConfig,
}
