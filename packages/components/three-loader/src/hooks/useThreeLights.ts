import * as THREE from 'three'
import { ref } from 'vue'
import type {
  AmbientLightConfig,
  DirectionalLightConfig,
  PointLightConfig,
  SpotLightConfig,
} from '../types/lights'

/**
 * 场景光源集合接口
 */
export interface SceneLights {
  /** 环境光 */
  ambient: THREE.AmbientLight | THREE.HemisphereLight
  /** 平行光 */
  directional: THREE.DirectionalLight
  /** 点光源 */
  point: THREE.PointLight
  /** 聚光灯 */
  spot: THREE.SpotLight
}

/**
 * Three.js 场景光源管理 Hook
 */
export function useThreeLights() {
  const lights = ref<SceneLights | null>(null)
  const helpers = ref<{ [key: string]: THREE.Object3D | null }>({
    directional: null,
    point: null,
  })
  let currentScene: THREE.Scene | null = null

  /**
   * 创建环境光
   */
  const createAmbientLight = (config: AmbientLightConfig) => {
    try {
      if (config.groundColor !== undefined) {
        return new THREE.HemisphereLight(config.color, config.groundColor, config.intensity)
      }
      return new THREE.AmbientLight(config.color, config.intensity)
    } catch (error) {
      console.error('创建环境光失败:', error)
      return new THREE.AmbientLight()
    }
  }

  /**
   * 创建平行光
   */
  const createDirectionalLight = (config: DirectionalLightConfig) => {
    try {
      const light = new THREE.DirectionalLight(config.color, config.intensity)
      light.position.set(config.position.x, config.position.y, config.position.z)

      if (config.shadow.enabled) {
        light.castShadow = true
        light.shadow.mapSize.width = config.shadow.mapSize
        light.shadow.mapSize.height = config.shadow.mapSize
        light.shadow.camera.near = 0.5
        light.shadow.camera.far = 500
        light.shadow.camera.left = -100
        light.shadow.camera.right = 100
        light.shadow.camera.top = 100
        light.shadow.camera.bottom = -100
        light.shadow.bias = -0.001
        light.shadow.normalBias = 0.1
      }

      return light
    } catch (error) {
      console.error('创建平行光失败:', error)
      return new THREE.DirectionalLight()
    }
  }

  /**
   * 创建点光源
   */
  const createPointLight = (config: PointLightConfig) => {
    try {
      const light = new THREE.PointLight(config.color, config.intensity * 3, config.distance * 2, 1)
      light.position.set(config.position.x, config.position.y, config.position.z)
      light.power = 800
      return light
    } catch (error) {
      console.error('创建点光源失败:', error)
      return new THREE.PointLight()
    }
  }

  /**
   * 创建聚光灯
   */
  const createSpotLight = (config: SpotLightConfig) => {
    try {
      const light = new THREE.SpotLight(
        config.color,
        config.intensity,
        config.distance,
        config.angle,
        config.penumbra,
        config.decay
      )
      light.position.set(config.position.x, config.position.y, config.position.z)

      const target = new THREE.Object3D()
      target.position.set(config.target.x, config.target.y, config.target.z)
      light.target = target

      if (config.shadow.enabled) {
        light.castShadow = true
        light.shadow.mapSize.width = config.shadow.mapSize
        light.shadow.mapSize.height = config.shadow.mapSize
        light.shadow.camera.near = config.shadow.camera.near
        light.shadow.camera.far = config.shadow.camera.far
      }

      return light
    } catch (error) {
      console.error('创建聚光灯失败:', error)
      return new THREE.SpotLight()
    }
  }

  /**
   * 更新光源配置
   */
  const updateLight = <T extends keyof SceneLights>(
    lightType: T,
    config: AmbientLightConfig | DirectionalLightConfig | PointLightConfig | SpotLightConfig
  ) => {
    if (!lights.value || !currentScene) {
      console.error('光源更新失败: 光源系统未初始化')
      return
    }

    const light = lights.value[lightType]
    if (!light) {
      console.error(`光源更新失败: 未找到类型为 "${lightType}" 的光源`)
      return
    }

    try {
      console.log(`正在更新 ${lightType} 光源，当前配置:`, {
        enabled: config.enabled,
        intensity: 'intensity' in config ? config.intensity : undefined,
        color: 'color' in config ? config.color : undefined,
      })

      // 更新可见性
      if ('enabled' in config) {
        light.visible = config.enabled

        // 如果光源被禁用，强制移除辅助线
        if (!config.enabled) {
          if (lightType === 'directional') {
            if (helpers.value.directional) {
              helpers.value.directional.visible = false
              currentScene.remove(helpers.value.directional)
              helpers.value.directional = null
              console.log('平行光辅助线已强制移除')
            }
          } else if (lightType === 'point') {
            if (helpers.value.point) {
              helpers.value.point.visible = false
              currentScene.remove(helpers.value.point)
              helpers.value.point = null
              console.log('点光源辅助线已强制移除')
            }
          }
        }
      }

      // 更新强度
      if ('intensity' in config) {
        const oldIntensity = light.intensity
        light.intensity = config.intensity
        console.log(`- 强度已更新: ${oldIntensity} -> ${light.intensity}`)
      }

      // 更新颜色
      if ('color' in config && typeof config.color === 'string') {
        const oldColor = light.color.getHexString()
        const color = new THREE.Color(config.color)
        light.color.copy(color)

        // 如果是点光源，增强颜色效果
        if (light instanceof THREE.PointLight) {
          light.intensity = config.intensity * 3 // 增强强度
        }

        console.log(`- 颜色已更新: #${oldColor} -> #${light.color.getHexString()}`)
      }

      // 如果是半球光，更新地面颜色
      if (light instanceof THREE.HemisphereLight && 'groundColor' in config) {
        const oldGroundColor = light.groundColor.getHexString()
        light.groundColor.set(config.groundColor)
        console.log(`- 地面颜色已更新: #${oldGroundColor} -> #${light.groundColor.getHexString()}`)
      }

      // 如果是可投射阴影的光源，更新阴影属性
      if ('shadow' in config && 'castShadow' in light) {
        const oldCastShadow = light.castShadow
        light.castShadow = config.shadow.enabled
        console.log(`- 阴影投射已更新: ${oldCastShadow} -> ${light.castShadow}`)
      }

      // 更新位置
      if ('position' in config) {
        const oldPosition = light.position.clone()
        light.position.set(config.position.x, config.position.y, config.position.z)

        // 如果是点光源，调整距离和功率
        if (light instanceof THREE.PointLight) {
          light.distance = Math.max(400, light.position.length() * 2) // 增加照射距离
          light.power = 800 // 保持较高的光源功率
          light.decay = 1 // 保持较低的衰减
        }

        console.log('光源位置已更新:', {
          old: oldPosition,
          new: light.position,
          distance: light.position.length(),
          power: light instanceof THREE.PointLight ? light.power : undefined,
        })

        // 如果是平行光或点光源，更新辅助线
        if (light instanceof THREE.DirectionalLight && helpers.value.directional) {
          helpers.value.directional.update()
        } else if (light instanceof THREE.PointLight && helpers.value.point) {
          helpers.value.point.update()
        }

        // 如果是点光源，确保阴影相机参数更新
        if (light instanceof THREE.PointLight && light.shadow) {
          // 更新阴影相机的远近平面
          light.shadow.camera.near = 0.1
          light.shadow.camera.far = light.distance
          light.shadow.camera.updateProjectionMatrix()
        }
      }

      // 处理辅助线显示/隐藏
      if ('helper' in config) {
        if (lightType === 'directional') {
          // 如果光源已禁用，不创建辅助线
          if (light.visible) {
            updateDirectionalLightHelper(config.helper as boolean)
          }
        } else if (lightType === 'point') {
          // 如果光源已禁用，不创建辅助线
          if (light.visible) {
            updatePointLightHelper(config.helper as boolean)
          }
        }
      }

      console.log(`${lightType} 光源更新完成`)
    } catch (error) {
      console.error(`光源更新失败:`, error)
    }
  }

  /**
   * 更新平行光辅助线
   */
  const updateDirectionalLightHelper = (show: boolean) => {
    if (!currentScene || !lights.value?.directional) return

    // 确保移除现有辅助线
    if (helpers.value.directional) {
      helpers.value.directional.visible = false
      currentScene.remove(helpers.value.directional)
      helpers.value.directional = null
    }

    // 只在需要显示时创建新的辅助线
    if (show && lights.value.directional.visible) {
      const helper = new THREE.DirectionalLightHelper(lights.value.directional, 5, 0xffff00)
      currentScene.add(helper)
      helpers.value.directional = helper
      console.log('平行光辅助线已添加')
    }
  }

  /**
   * 更新点光源辅助线
   */
  const updatePointLightHelper = (show: boolean) => {
    if (!currentScene || !lights.value?.point) return

    // 确保移除现有辅助线
    if (helpers.value.point) {
      helpers.value.point.visible = false
      currentScene.remove(helpers.value.point)
      helpers.value.point = null
    }

    // 只在需要显示时创建新的辅助线
    if (show && lights.value.point.visible) {
      const helper = new THREE.PointLightHelper(lights.value.point, 5, 0xffff00)
      currentScene.add(helper)
      helpers.value.point = helper
      console.log('点光源辅助线已添加')
    }
  }

  /**
   * 将光源添加到场景中
   */
  const addLightsToScene = (scene: THREE.Scene, configs: IModelControls['lights']) => {
    try {
      console.log('开始初始化场景光源...')
      currentScene = scene // 保存场景引用

      const newLights: SceneLights = {
        ambient: createAmbientLight(configs.ambient),
        directional: createDirectionalLight(configs.directional),
        point: createPointLight(configs.point),
        spot: createSpotLight(configs.spot),
      }

      // 添加光源到场景
      Object.entries(newLights).forEach(([type, light]) => {
        scene.add(light)
        console.log(`- ${type} 光源已添加到场景`)
      })

      lights.value = newLights
      console.log('场景光源初始化完成')
      return newLights
    } catch (error) {
      console.error('光源初始化失败:', error)
      throw error
    }
  }

  /**
   * 从场景中移除光源
   */
  const removeLightsFromScene = (scene: THREE.Scene) => {
    if (!lights.value) return

    // 确保移除所有辅助线
    Object.entries(helpers.value).forEach(([type, helper]) => {
      if (helper) {
        scene.remove(helper)
        console.log(`${type} 辅助线已移除`)
      }
    })
    helpers.value = { directional: null, point: null }

    // 移除所有光源
    Object.values(lights.value).forEach(light => {
      scene.remove(light)
    })

    lights.value = null
    currentScene = null
  }

  return {
    lights,
    addLightsToScene,
    removeLightsFromScene,
    updateLight,
  }
}
