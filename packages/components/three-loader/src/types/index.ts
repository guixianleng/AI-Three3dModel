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
    /** 环境光强度 */
    ambientIntensity: number
    /** 主光源强度 */
    mainLightIntensity: number
    /** 补光强度 */
    fillLightIntensity: number
    /** 半球光强度 */
    hemiLightIntensity: number
    /** 阴影开关 */
    shadowEnabled: boolean
    /** 主光源角度 */
    mainLightAngle: {
      x: number
      y: number
      z: number
    }
    /** 补光角度 */
    fillLightAngle: {
      x: number
      y: number
      z: number
    }
  }
}