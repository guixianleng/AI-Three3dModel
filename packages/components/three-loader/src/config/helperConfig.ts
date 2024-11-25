import type { IHelperOptions } from '../types/scene'

/**
 * 网格相关配置
 */
export interface GridConfig {
  show: boolean
  size: number
  divisions: number
  color: string | number
}

/**
 * 坐标轴相关配置
 */
export interface AxesConfig {
  show: boolean
  size: number
}

/**
 * 地板相关配置
 */
export interface FloorConfig {
  show: boolean
  color: number | string
  opacity: number
}

/**
 * 性能监控相关配置
 */
export interface StatsConfig {
  show: boolean
}

/**
 * 默认辅助工具配置
 */
export const defaultHelperConfig: IHelperOptions = {
  grid: {
    show: false,
    size: 1000,
    divisions: 100,
    color: '#888',
  },
  axes: {
    show: false,
    size: 400,
  },
  floor: {
    show: true,
    color: '#666',
    opacity: 0.5,
  },
  stats: {
    show: true,
  },
}
