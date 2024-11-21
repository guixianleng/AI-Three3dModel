import { ref, shallowRef } from 'vue'
import * as THREE from 'three'
import { 
  loadModel, 
  ModelFileType, 
  type LoaderOptions, 
  type TextureOptions 
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
        }
      })

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
        hasMixer: !!newMixer
      })

      return {
        model: object as THREE.Group,
        mixer: newMixer,
        animations: newAnimations
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
   * 更新模型材质
   * @param options - 材质处理选项
   */
  const updateMaterials = (options: TextureOptions = {}) => {
    if (!model.value) return
    processModelMaterials(model.value, options)
  }

  /**
   * 清理模型资源
   */
  const dispose = () => {
    if (model.value) {
      model.value.traverse((child) => {
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
    dispose
  }
} 