import * as THREE from 'three'

export interface SceneLights {
  ambientLight: THREE.AmbientLight
  mainLight: THREE.DirectionalLight
  fillLight: THREE.DirectionalLight
  hemiLight: THREE.HemisphereLight
}

export function useThreeLights() {
  const createLights = (): SceneLights => {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)

    // 主平行光（用于产生阴影）
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

    // 补光
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
    fillLight.position.set(-50, 100, -50)

    // 半球光
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.2)
    hemiLight.position.set(0, 200, 0)

    return {
      ambientLight,
      mainLight,
      fillLight,
      hemiLight
    }
  }

  const addLightsToScene = (scene: THREE.Scene): SceneLights => {
    const lights = createLights()
    
    scene.add(lights.ambientLight)
    scene.add(lights.mainLight)
    scene.add(lights.fillLight)
    scene.add(lights.hemiLight)

    return lights
  }

  const removeLightsFromScene = (scene: THREE.Scene, lights: SceneLights) => {
    scene.remove(lights.ambientLight)
    scene.remove(lights.mainLight)
    scene.remove(lights.fillLight)
    scene.remove(lights.hemiLight)
  }

  return {
    createLights,
    addLightsToScene,
    removeLightsFromScene
  }
} 