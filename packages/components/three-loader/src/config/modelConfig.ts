import type { IModelControls } from '../types/controls'
import { defaultLightConfig } from './lightConfig'
import { defaultHelperConfig } from './helperConfig'

/**
 * 默认模型配置
 */
export const defaultModelConfig: IModelControls = {
  scale: 1,
  isPlaying: false,
  wireframe: false,
  lights: defaultLightConfig,
  helperConfig: defaultHelperConfig
}

/**
 * 模型加载配置
 */
export const modelLoadConfig = {
  scale: defaultModelConfig.scale,
  position: defaultHelperConfig.modelPosition,
  rotation: {
    x: 0,
    y: 0,
    z: 0
  }
} 