import { ref, shallowRef } from 'vue'
import * as THREE from 'three'
import {
  loadModel,
  type LoaderOptions,
  type TextureOptions,
  getModelBounds,
} from '../utils/modelUtils'
import type { ModelLoadResult } from '../types/animation'
import type { IPosition } from '../types/positions'

/**
 * Three.js 模型管理 Hook
 */
export function useThreeModel(options: LoaderOptions = {}) {
  const loading = ref(true)
  const loadingProgress = ref(0)
  const model = shallowRef<THREE.Group | null>(null)
  const mixer = shallowRef<THREE.AnimationMixer | null>(null)
  const animations = ref<THREE.AnimationAction[]>([])

  /**
   * 加载3D模型
   * @param url - 模型文件URL
   * @param scene - Three.js 场景实例
   * @returns Promise<ModelLoadResult>
   */
  const loadModelFile = async (url: string, scene: THREE.Scene): Promise<ModelLoadResult> => {
    if (!scene) {
      console.error('场景未初始化')
      return Promise.reject(new Error('场景未初始化'))
    }

    try {
      console.log('开始加载模型:', url)
      loading.value = true
      loadingProgress.value = 0

      // 加载模型
      const object = await loadModel(url, scene, {
        ...options,
        onProgress: (event: ProgressEvent) => {
          if (event.lengthComputable) {
            loadingProgress.value = (event.loaded / event.total) * 100
            console.log('加载进度:', loadingProgress.value.toFixed(1) + '%')
          }
        },
      })

      // 确保模型正确放置在地板上
      const bounds = getModelBounds(object)
      if (bounds.minY < 0) {
        // 如果模型最低点低于0，将整个模型向上移动
        object.position.y -= bounds.minY
      }

      // 创建动画混合器
      const newMixer = new THREE.AnimationMixer(object)

      // 如果是 FBX 模型，动画在 object.animations 中
      let newAnimations: THREE.AnimationAction[] = []
      if ('animations' in object && Array.isArray(object.animations)) {
        newAnimations = object.animations.map(clip => newMixer.clipAction(clip))
      }

      // 更新状态
      model.value = object as THREE.Group
      mixer.value = newMixer
      animations.value = newAnimations

      loading.value = false
      console.log('模型加载完成', {
        animations: newAnimations.length,
        hasMixer: !!newMixer,
      })

      return {
        model: object as THREE.Group,
        mixer: newMixer,
        animations: newAnimations,
      }
    } catch (error) {
      loading.value = false
      console.error('模型加载失败:', error)
      throw error
    }
  }

  /**
   * 更新模型位置
   * @param position - 新的位置坐标
   */
  const updatePosition = (position: IPosition) => {
    if (!model.value) return
    const { x, y, z } = position
    model.value.position.set(x, y, z)
  }

  /**
   * 更新模型缩放
   * @param scale - 缩放值
   */
  const updateScale = (scale: number) => {
    if (!model.value) return
    model.value.scale.setScalar(scale)
  }

  /**
   * 更新模型旋转
   * @param rotation - 旋转角度（弧度）
   */
  const updateRotation = (rotation: IPosition) => {
    if (!model.value) return
    const { x, y, z } = rotation
    model.value.rotation.set(x, y, z)
  }

  /**
   * 更新材质
   */
  const updateMaterials = (options: IMaterialUpdateOptions) => {
    try {
      const { name, property, value } = options
      
      // 如果是更新所有材质
      if (name === 'all') {
        model.value?.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            if (Array.isArray(node.material)) {
              node.material.forEach(material => {
                updateMaterialProperty(material, property, value)
              })
            } else {
              updateMaterialProperty(node.material, property, value)
            }
          }
        })
        return
      }

      // 更新单个材质
      model.value?.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          if (Array.isArray(node.material)) {
            const targetMaterial = node.material.find(m => m.name === name)
            if (targetMaterial) {
              updateMaterialProperty(targetMaterial, property, value)
            }
          } else if (node.material.name === name) {
            updateMaterialProperty(node.material, property, value)
          }
        }
      })
    } catch (error) {
      console.error('更新材质失败:', error)
    }
  }

  /**
   * 更新材质属性
   */
  const updateMaterialProperty = (material: THREE.Material, property: string, value: any) => {
    try {
      switch (property) {
        case 'color':
          if ('color' in material) {
            (material as THREE.MeshStandardMaterial).color.setHex(value)
          }
          break
        case 'opacity':
          material.opacity = value
          break
        case 'transparent':
          material.transparent = value
          if (!value) {
            material.opacity = 1
          }
          break
        case 'wireframe':
          if ('wireframe' in material) {
            (material as THREE.MeshStandardMaterial).wireframe = value
          }
          break
        case 'visible':
          material.visible = value
          break
        case 'depthWrite':
          material.depthWrite = value
          break
        case 'map':
          if ('map' in material) {
            if (value) {
              // 创建纹理加载器
              const textureLoader = new THREE.TextureLoader()
              
              // 加载纹理
              textureLoader.load(
                value,
                (texture) => {
                  // 设置纹理参数
                  texture.colorSpace = THREE.SRGBColorSpace
                  texture.wrapS = THREE.RepeatWrapping
                  texture.wrapT = THREE.RepeatWrapping
                  texture.minFilter = THREE.LinearFilter
                  texture.magFilter = THREE.LinearFilter
                  texture.needsUpdate = true

                  // 更新材质贴图
                  if (material instanceof THREE.Material) {
                    if ('map' in material) {
                      // 如果存在旧的贴图，先释放它
                      if ((material as THREE.MeshStandardMaterial).map) {
                        (material as THREE.MeshStandardMaterial).map.dispose()
                      }
                      (material as THREE.MeshStandardMaterial).map = texture
                      material.needsUpdate = true
                      console.log('贴图更新成功:', value)
                    }
                  }
                },
                (progress) => {
                  console.log('贴图加载进度:', ((progress.loaded / progress.total) * 100).toFixed(1) + '%')
                },
                (error) => {
                  console.error('贴图加载失败:', error)
                }
              )
            } else {
              // 如果存在旧的贴图，释放它
              if ((material as THREE.MeshStandardMaterial).map) {
                (material as THREE.MeshStandardMaterial).map.dispose()
              }
              (material as THREE.MeshStandardMaterial).map = null
              material.needsUpdate = true
            }
          }
          break
      }
      material.needsUpdate = true
    } catch (error) {
      console.error('更新材质属性失败:', error)
    }
  }

  /**
   * 清理模型资源
   */
  const dispose = () => {
    if (model.value) {
      model.value.traverse(child => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) {
            child.geometry.dispose()
          }
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material]
            materials.forEach(material => {
              material.dispose()
            })
          }
        }
      })
      model.value = null
    }

    if (mixer.value) {
      mixer.value.stopAllAction()
      mixer.value.uncacheRoot(mixer.value.getRoot())
      mixer.value = null
    }

    animations.value = []
    loading.value = false
    loadingProgress.value = 0
  }

  return {
    loading,
    loadingProgress,
    model,
    mixer,
    animations,
    loadModel: loadModelFile,
    updatePosition,
    updateScale,
    updateRotation,
    updateMaterials,
    dispose,
  }
}
