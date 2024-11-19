import * as THREE from 'three'
import { ref } from 'vue'

/**
 * 场景光源配置接口
 */
export interface SceneLights {
  /** 环境光 - 用于整体环境照明 */
  ambientLight: THREE.AmbientLight
  /** 主平行光 - 用于产生主要阴影和方向性照明 */
  mainLight: THREE.DirectionalLight
  /** 补光 - 用于填充阴影区域 */
  fillLight: THREE.DirectionalLight
  /** 半球光 - 用于模拟环境反射光 */
  hemiLight: THREE.HemisphereLight
}

/**
 * Three.js 场景光源管理 Hook
 */
export function useThreeLights() {
  const lights = ref<SceneLights | null>(null)

  /**
   * 创建场景所需的所有光源
   */
  const createLights = (): SceneLights => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)

    const mainLight = new THREE.DirectionalLight(0xffffff, 1)
    mainLight.position.set(50, 100, 50)
    mainLight.castShadow = true
    mainLight.shadow.mapSize.width = 2048
    mainLight.shadow.mapSize.height = 2048
    mainLight.shadow.camera.near = 0.5
    mainLight.shadow.camera.far = 500
    mainLight.shadow.camera.left = -100
    mainLight.shadow.camera.right = 100
    mainLight.shadow.camera.top = 100
    mainLight.shadow.camera.bottom = -100
    mainLight.shadow.bias = -0.0001

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
    fillLight.position.set(-50, 100, -50)

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.2)
    hemiLight.position.set(0, 200, 0)

    return {
      ambientLight,
      mainLight,
      fillLight,
      hemiLight
    }
  }

  /**
   * 更新光源强度
   */
  const updateLightIntensity = (
    lightType: keyof SceneLights,
    intensity: number
  ) => {
    if (lights.value) {
      console.log(`更新${lightType}强度:`, intensity)
      switch(lightType) {
        case 'ambientLight':
          lights.value.ambientLight.intensity = intensity
          break
        case 'mainLight':
          lights.value.mainLight.intensity = intensity
          break
        case 'fillLight':
          lights.value.fillLight.intensity = intensity
          break
        case 'hemiLight':
          lights.value.hemiLight.intensity = intensity
          break
      }
    }
  }

  /**
   * 更新阴影状态
   */
  const updateShadowEnabled = (enabled: boolean) => {
    if (lights.value) {
      lights.value.mainLight.castShadow = enabled
    }
  }

  /**
   * 将光源添加到场景中
   */
  const addLightsToScene = (scene: THREE.Scene): SceneLights => {
    const newLights = createLights()
    
    scene.add(newLights.ambientLight)
    scene.add(newLights.mainLight)
    scene.add(newLights.fillLight)
    scene.add(newLights.hemiLight)

    lights.value = newLights
    return newLights
  }

  /**
   * 从场景中移除光源
   */
  const removeLightsFromScene = (scene: THREE.Scene, sceneLights: SceneLights) => {
    scene.remove(sceneLights.ambientLight)
    scene.remove(sceneLights.mainLight)
    scene.remove(sceneLights.fillLight)
    scene.remove(sceneLights.hemiLight)
    lights.value = null
  }

  /**
   * 更新光源位置
   * @param lightType - 光源类型
   * @param angle - 角度对象，包含 x、y、z 三个方向的角度（弧度）
   */
  const updateLightAngle = (
    lightType: 'mainLight' | 'fillLight',
    angle: { x: number; y: number; z: number }
  ) => {
    if (!lights.value) return

    const light = lights.value[lightType]
    const radius = lightType === 'mainLight' ? 100 : 50 // 主光源和补光的距离

    // 将角度转换为弧度
    const radX = THREE.MathUtils.degToRad(angle.x)
    const radY = THREE.MathUtils.degToRad(angle.y)
    const radZ = THREE.MathUtils.degToRad(angle.z)

    // 计算新的位置
    const x = radius * Math.sin(radY) * Math.cos(radX)
    const y = radius * Math.sin(radX)
    const z = radius * Math.cos(radY) * Math.cos(radX)

    // 更新光源位置
    light.position.set(x, y, z)
    light.lookAt(0, 0, 0)
  }

  return {
    lights,
    createLights,
    addLightsToScene,
    removeLightsFromScene,
    updateLightIntensity,
    updateShadowEnabled,
    updateLightAngle
  }
} 