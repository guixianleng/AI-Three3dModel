import type { SceneLightsConfig } from '../types/lights'

/**
 * 默认光源配置
 */
export const defaultLightConfig: SceneLightsConfig = {
  // 环境光配置
  ambient: {
    enabled: true,
    intensity: 0.5,
    color: '#ffffff',
    groundColor: '#444444', // 半球光地面颜色
  },

  // 平行光配置
  directional: {
    enabled: true,
    color: '#ffffff',
    intensity: 1,
    position: { x: 50, y: 50, z: 50 },
    shadow: {
      enabled: true,
      mapSize: 4096,
      camera: {
        near: 1,
        far: 1000,
        left: -100,
        right: 100,
        top: 100,
        bottom: -100,
      },
    },
    helper: false,
  },

  // 点光源配置 - 默认禁用且位置在原点
  point: {
    enabled: false,
    intensity: 1,
    color: '#ffffff',
    position: { x: 0, y: 0, z: 0 },
    distance: 400,
    decay: 1,
    shadow: {
      enabled: false,
      mapSize: 1024,
      bias: -0.001,
      radius: 4,
      blurSamples: 8,
      camera: {
        near: 0.5,
        far: 500,
      },
    },
  },

  // 聚光灯配置
  spot: {
    enabled: false,
    intensity: 1,
    color: '#ffffff',
    position: { x: 10, y: 10, z: 10 },
    target: { x: 0, y: 0, z: 0 },
    angle: Math.PI / 6,
    penumbra: 0.1,
    distance: 200,
    decay: 2,
    shadow: {
      enabled: true,
      mapSize: 1024,
      bias: -0.001,
      radius: 4,
      blurSamples: 8,
      camera: {
        near: 0.5,
        far: 500,
      },
    },
  },
}
