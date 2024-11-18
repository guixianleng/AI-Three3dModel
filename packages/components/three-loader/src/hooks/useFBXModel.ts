import * as THREE from 'three'
import { ref } from 'vue'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

/** 模型加载结果接口 */
export interface ModelLoadResult {
  /** 加载的模型对象 */
  model: Object3D
  /** 动画混合器 */
  mixer: AnimationMixer
  /** 动画动作数组 */
  animations: AnimationAction[]
}

/**
 * FBX模型加载和管理 Hook
 * @returns {Object} 模型加载相关的状态和方法
 */
export function useFBXModel() {
  // 加载状态
  const loading = ref(true)
  // 加载进度
  const loadingProgress = ref(0)
  // 模型对象
  let model: THREE.Object3D
  // 动画混合器
  let mixer: THREE.AnimationMixer
  // 动画动作数组
  let animations: THREE.AnimationAction[] = []

  /**
   * 加载FBX模型
   * @param url - 模型文件URL
   * @param scene - Three.js 场景对象
   * @returns Promise 返回加载结果，包含模型、混合器和动画
   */
  const loadModel = (url: string, scene: THREE.Scene): Promise<ModelLoadResult> => {
    if (!scene) {
      console.error('场景未初始化')
      return Promise.reject(new Error('场景未初始化'))
    }

    console.log('开始加载模型:', url)
    const loader = new FBXLoader()
    
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (object) => {
          try {
            console.log('FBX 加载成功:', object)
            model = object
            
            // 调整模型位置和大小
            model.position.set(0, 0, 0)
            model.scale.setScalar(0.5)
            
            // 设置模型材质和阴影
            object.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
                if (child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                      mat.roughness = 0.7
                      mat.metalness = 0.3
                      mat.needsUpdate = true
                    })
                  } else {
                    child.material.roughness = 0.7
                    child.material.metalness = 0.3
                    child.material.needsUpdate = true
                  }
                }
              }
            })

            // 添加模型到场景
            if (!scene.children.includes(model)) {
              scene.add(model)
              console.log('模型已添加到场景:', scene.children)
            }

            // 处理动画
            if (object.animations.length > 0) {
              console.log('发现动画:', object.animations.length, '个')
              mixer = new THREE.AnimationMixer(object)
              object.animations.forEach((clip, index) => {
                console.log(`动画 ${index}:`, clip.name)
                const action = mixer.clipAction(clip)
                action.setLoop(THREE.LoopRepeat)
                action.fadeIn(0.5)
                animations.push(action)
              })
            }

            loading.value = false
            resolve({ model, mixer, animations })
          } catch (error) {
            console.error('处理模型时发生错误:', error)
            reject(error)
          }
        },
        // 加载进度回调
        (xhr) => {
          loadingProgress.value = (xhr.loaded / xhr.total) * 100
          console.log('加载进度:', loadingProgress.value + '%')
        },
        // 加载错误回调
        (error) => {
          console.error('FBX加载错误:', error)
          loading.value = false
          reject(error)
        }
      )
    })
  }

  return {
    loading,
    loadingProgress,
    loadModel,
    model // 导出模型对象以便外部访问
  }
} 