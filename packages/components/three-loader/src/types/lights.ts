/**
 * 光源基础配置接口
 */
export interface BaseLightConfig {
  /** 是否启用 */
  enabled: boolean
  /** 光照强度 */
  intensity: number
  /** 光照颜色 */
  color: string
}

/**
 * 阴影相机配置接口
 */
export interface ShadowCameraConfig {
  /** 近裁剪面 */
  near: number
  /** 远裁剪面 */
  far: number
  /** 左平面 */
  left?: number
  /** 右平面 */
  right?: number
  /** 上平面 */
  top?: number
  /** 底平面 */
  bottom?: number
}

/**
 * 阴影配置接口
 */
export interface ShadowConfig {
  /** 是否启用阴影 */
  enabled: boolean
  /** 阴影贴图大小 */
  mapSize: number
  /** 阴影偏差 */
  bias: number
  /** 阴影半径 */
  radius: number
  /** 阴影模糊采样 */
  blurSamples: number
  /** 阴影相机配置 */
  camera: ShadowCameraConfig
}

/**
 * 环境光配置接口
 */
export interface AmbientLightConfig extends BaseLightConfig {
  /** 地面反射颜色（用于半球光） */
  groundColor?: string
}

/**
 * 平行光配置接口
 */
export interface DirectionalLightConfig extends BaseLightConfig {
  /** 光源位置 */
  position: IPosition
  /** 阴影配置 */
  shadow: ShadowConfig
}

/**
 * 点光源配置接口
 */
export interface PointLightConfig extends BaseLightConfig {
  /** 光源位置 */
  position: IPosition
  /** 照射距离 */
  distance: number
  /** 衰减系数 */
  decay: number
  /** 阴影配置 */
  shadow: ShadowConfig
}

/**
 * 聚光灯配置接口
 */
export interface SpotLightConfig extends BaseLightConfig {
  /** 光源位置 */
  position: IPosition
  /** 目标点位置 */
  target: IPosition
  /** 光照角度 */
  angle: number
  /** 边缘柔和度 */
  penumbra: number
  /** 照射距离 */
  distance: number
  /** 衰减系数 */
  decay: number
  /** 阴影配置 */
  shadow: ShadowConfig
}

/**
 * 场景光源配置接口
 */
export interface SceneLightsConfig {
  /** 环境光配置 */
  ambient: LightConfig
  /** 平行光配置 */
  directional: LightConfig
  /** 点光源配置 */
  point: LightConfig
  /** 聚光灯配置 */
  spot: LightConfig
}

/**
 * 光源配置接口
 */
export interface LightConfig {
  enabled: boolean
  intensity: number
  color: string
  position?: {
    x: number
    y: number
    z: number
  }
  shadow?: {
    enabled: boolean
    mapSize: number
    bias: number
  }
}
