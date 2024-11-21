import type { ICameraOptions } from './camera'
import type { IControlsOptions } from './controls'
import type { SceneLightsConfig } from './lights'
import type { IPosition } from './positions'
import { BackgroundType } from '../config/helperConfig'

/**
 * 场景配置选项接口
 */
export interface ISceneOptions {
  /** 背景颜色 */
  backgroundColor?: number | string
  /** 相机配置 */
  camera?: ICameraOptions
  /** 光源配置 */
  lights?: SceneLightsConfig
  /** 控制器配置 */
  controls?: IControlsOptions
  /** 辅助工具配置 */
  helper?: IHelperOptions
}

/**
 * 辅助工具配置选项接口
 */
export interface IHelperOptions {
  /** 是否显示网格 */
  showGrid?: boolean
  /** 是否显示性能监控 */
  showStats?: boolean
  /** 是否显示坐标轴 */
  showAxes?: boolean
  /** 是否显示地板 */
  showFloor?: boolean
  /** 网格大小 */
  gridSize?: number
  /** 网格分段数 */
  gridDivisions?: number
  /** 网格颜色 */
  gridColor?: string
  /** 坐标轴大小 */
  axesSize?: number
  /** 地板颜色 */
  floorColor?: string
  /** 模型位置 */
  modelPosition?: IPosition
  /** 背景颜色 */
  backgroundColor?: string
  backgroundType?: BackgroundType
  backgroundImage?: string
}