/**
 * 相机配置选项接口
 */
export interface ICameraOptions {
  /** 视野角度 */
  fov?: number
  /** 近裁剪面 */
  near?: number
  /** 远裁剪面 */
  far?: number
  /** 初始位置 */
  position?: {
    x: number
    y: number
    z: number
  }
}
