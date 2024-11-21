import type { IHelperOptions } from '../types/scene'

/**
 * 默认辅助工具配置
 */
export const defaultHelperConfig: IHelperOptions = {
  showGrid: false,
  showStats: true,
  showAxes: false,
  showFloor: false,
  gridSize: 2000,
  gridDivisions: 100,
  gridColor: '#888888',
  axesSize: 1000,
  floorColor: '#cccccc',
  modelPosition: { x: 0, y: 0, z: 0 }
} 