/** 光源基础配置接口 */
interface BaseLightConfig {
  /** 是否启用 */
  enabled: boolean
  /** 光照强度 */
  intensity: number
  /** 光照颜色 */
  color: string
}

/** 方向性光源配置接口 */
interface DirectionalLightConfig extends BaseLightConfig {
  /** 位置 */
  position: {
    x: number
    y: number
    z: number
  }
  /** 阴影配置 */
  shadow: {
    enabled: boolean
    mapSize: number
    bias: number
    radius: number
    blurSamples: number
    camera: {
      near: number
      far: number
      left: number
      right: number
      top: number
      bottom: number
    }
  }
}

/** 点光源配置接口 */
interface PointLightConfig extends BaseLightConfig {
  /** 位置 */
  position: {
    x: number
    y: number
    z: number
  }
  /** 衰减距离 */
  distance: number
  /** 衰减系数 */
  decay: number
  /** 阴影配置 */
  shadow: {
    enabled: boolean
    mapSize: number
    bias: number
    radius: number
    blurSamples: number
    camera: {
      near: number
      far: number
    }
  }
}

/** 聚光灯配置接口 */
interface SpotLightConfig extends BaseLightConfig {
  /** 位置 */
  position: {
    x: number
    y: number
    z: number
  }
  /** 目标点 */
  target: {
    x: number
    y: number
    z: number
  }
  /** 光束角度 */
  angle: number
  /** 聚光灯边缘柔化程度 */
  penumbra: number
  /** 衰减距离 */
  distance: number
  /** 衰减系数 */
  decay: number
  /** 阴影配置 */
  shadow: {
    enabled: boolean
    mapSize: number
    bias: number
    radius: number
    blurSamples: number
    camera: {
      near: number
      far: number
    }
  }
}

/** 环境光配置接口 */
interface AmbientLightConfig extends BaseLightConfig {
  /** 地面反射颜色（用于半球光） */
  groundColor?: string
}

/** 模型控制状态接口 */
export interface IModelControls {
  /** 模型缩放比例 */
  scale: number
  /** 动画播放状态 */
  isPlaying: boolean
  /** 线框模式状态 */
  wireframe: boolean
  /** 光源控制 */
  lights: {
    /** 环境光配置 */
    ambient: AmbientLightConfig
    /** 主平行光配置 */
    directional: DirectionalLightConfig
    /** 点光源配置 */
    point: PointLightConfig
    /** 聚光灯配置 */
    spot: SpotLightConfig
  }
}

/** 光源配置接口 */
export interface ILights {
  enabled: boolean
  color: string
  intensity: number
  position: {
    x: number
    y: number
    z: number
  }
}