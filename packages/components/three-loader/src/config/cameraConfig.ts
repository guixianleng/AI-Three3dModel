import type { ICameraOptions } from '../types/camera'
import type { IPosition } from '../types/positions'

/**
 * 相机位置配置
 */
export interface CameraPositionConfig {
  /** 初始位置 */
  initial: IPosition
  /** 目标位置（lookAt） */
  target: IPosition
}

/**
 * 相机配置接口
 */
export interface CameraConfig extends ICameraOptions {
  /** 视场角 */
  fov: number
  /** 近平面 */
  near: number
  /** 远平面 */
  far: number
  /** 位置配置 */
  position: CameraPositionConfig
}

/**
 * 默认相机配置
 */
export const defaultCameraConfig: CameraConfig = {
  fov: 75,
  near: 0.1,
  far: 1000,
  position: {
    initial: { x: 0, y: 100, z: 200 },
    target: { x: 0, y: 0, z: 0 },
  },
}
