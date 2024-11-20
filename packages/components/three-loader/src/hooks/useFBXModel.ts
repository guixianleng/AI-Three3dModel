import * as THREE from 'three'
import { ref, shallowRef } from 'vue'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

/** 模型加载结果接口 */
export interface ModelLoadResult {
  /** 加载的模型对象 */
  model: THREE.Group
  /** 动画混合器 */
  mixer: THREE.AnimationMixer
  /** 动画动作数组 */
  animations: THREE.AnimationAction[]
}

/**
 * FBX模型加载和管理 Hook
 */
export function useFBXModel() {
  // 加载状态
  const loading = ref(true)
  // 加载进度
  const loadingProgress = ref(0)
  // 使用 shallowRef 来存储 Three.js 对象
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
              console.log('FBX 加载成功:', object)
              
              // 调整模型位置和大小
              object.position.set(0, 0, 0)
              object.scale.setScalar(0.5)
              
              // 设置模型材质和阴影
              object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  // 确保使用标准材质
                  if (child.material) {
                    if (Array.isArray(child.material)) {
                      child.material = child.material.map(mat => {
                        // 创建新的标准材质，保留原始颜色和贴图
                        const newMat = new THREE.MeshPhongMaterial({
                          color: mat.color || 0xffffff,
                          map: mat.map,
                          normalMap: mat.normalMap,
                          shininess: 30,           // 增加光泽度
                          specular: 0x444444,      // 设置高光颜色
                          reflectivity: 1,         // 增加反射率
                          side: THREE.DoubleSide,  // 双面渲染
                          transparent: true,        // 启用透明
                          opacity: 1               // 设置不透明度
                        })
                        // 确保材质更新
                        newMat.needsUpdate = true
                        return newMat
                      })
                    } else {
                      // 创建新的标准材质
                      const newMat = new THREE.MeshPhongMaterial({
                        color: child.material.color || 0xffffff,
                        map: child.material.map,
                        normalMap: child.material.normalMap,
                        shininess: 30,
                        specular: 0x444444,
                        reflectivity: 1,
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 1
                      })
                      child.material = newMat
                      child.material.needsUpdate = true
                    }
                  }

                  // 设置阴影
                  child.castShadow = true
                  child.receiveShadow = true

                  // 确保法线正确
                  if (child.geometry) {
                    child.geometry.computeVertexNormals()
                    child.geometry.computeBoundingSphere()
                    child.geometry.computeBoundingBox()
                    child.geometry.normalizeNormals()
                  }

                  // 打印材质信息以便调试
                  console.log('Mesh材质信息:', {
                    name: child.name,
                    material: child.material,
                    geometry: child.geometry
                  })
                }
              })

              // 添加模型到场景
              scene.add(object)
              console.log('模型已添加到场景')

              // 保存模型引用
              model.value = object

              // 处理动画
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
            console.log('加载进度:', loadingProgress.value + '%')
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