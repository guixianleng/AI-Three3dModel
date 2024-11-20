import type { IModelControls } from '../types/controls'
import { defaultLightConfig } from './lightConfig'
import { defaultHelperConfig } from './helperConfig'

/**
 * 默认模型控制配置
 */
export const defaultModelConfig: IModelControls = {
  scale: 0.5,
  isPlaying: false,
  wireframe: false,
  lights: defaultLightConfig,
  helperConfig: defaultHelperConfig
} 