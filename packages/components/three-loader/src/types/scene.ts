import type { ICameraOptions } from './camera'
import type { IControlsOptions } from './controls'
import type { SceneLightsConfig } from './lights'
import type { 
  GridConfig, 
  AxesConfig, 
  FloorConfig, 
  StatsConfig 
} from '../config/helperConfig'

/**
 * 场景配置选项接口
 */
export interface ISceneOptions {
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
  /** 网格配置 */
  grid?: GridConfig
  /** 坐标轴配置 */
  axes?: AxesConfig
  /** 地板配置 */
  floor?: FloorConfig
  /** 性能监控配置 */
  stats?: StatsConfig
}