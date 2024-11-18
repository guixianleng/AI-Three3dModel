/** 模型控制状态接口 */
export interface IModelControls {
  /** 模型缩放比例 */
  scale: number
  /** 动画播放状态 */
  isPlaying: boolean
  /** 线框模式状态 */
  wireframe: boolean
}