import * as THREE from 'three'
import { ref, shallowRef } from 'vue'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import type { ModelLoadResult } from '../types/animation'

/**
 * FBX模型加载和管理 Hook
 */
export function useFBXModel() {
  const loading = ref(true)
  const loadingProgress = ref(0)
  const model = shallowRef<THREE.Group | null>(null)

  /**
   * 加载FBX模型
   */
  const loadModel = async (url: string, scene: THREE.Scene): Promise<ModelLoadResult> => {
    if (!scene) {
      console.error('场景未初始化')
      return Promise.reject(new Error('场景未初始化'))
    }

    console.log('开始加载模型:', url)
    const loader = new FBXLoader()
    
    return new Promise((resolve, reject) => {
      try {
        loader.load(
          url,
          (object) => {
            try {
              // 调整模型位置和大小
              object.position.set(0, 0, 0)
              object.scale.setScalar(0.5)
              
              // 设置模型材质和阴影
              object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  // 设置材质
                  if (child.material) {
                    const materials = Array.isArray(child.material) ? child.material : [child.material]
                    materials.forEach(mat => {
                      const newMat = new THREE.MeshPhongMaterial({
                        color: mat.color || 0xffffff,
                        map: mat.map,
                        normalMap: mat.normalMap,
                        shininess: 30,
                        specular: 0x444444,
                        reflectivity: 1,
                        side: THREE.DoubleSide
                      })
                      newMat.needsUpdate = true
                      if (!Array.isArray(child.material)) {
                        child.material = newMat
                      }
                    })
                  }

                  // 设置阴影
                  child.castShadow = true
                  child.receiveShadow = true

                  // 更新几何体
                  if (child.geometry) {
                    child.geometry.computeVertexNormals()
                    child.geometry.computeBoundingSphere()
                    child.geometry.computeBoundingBox()
                  }
                }
              })

              // 添加模型到场景
              scene.add(object)
              model.value = object
              console.log('模型已添加到场景')

              // 创建动画混合器和动作
              const mixer = new THREE.AnimationMixer(object)
              const animations = object.animations.map(clip => mixer.clipAction(clip))

              loading.value = false
              resolve({ model: object, mixer, animations })
            } catch (error) {
              console.error('处理模型时发生错误:', error)
              loading.value = false
              reject(error)
            }
          },
          (xhr) => {
            loadingProgress.value = (xhr.loaded / xhr.total) * 100
            console.log('加载进度:', loadingProgress.value.toFixed(1) + '%')
          },
          (error) => {
            console.error('FBX加载错误:', error)
            loading.value = false
            reject(error)
          }
        )
      } catch (error) {
        console.error('加载器初始化失败:', error)
        loading.value = false
        reject(error)
      }
    })
  }

  return {
    loading,
    loadingProgress,
    model,
    loadModel
  }
} 