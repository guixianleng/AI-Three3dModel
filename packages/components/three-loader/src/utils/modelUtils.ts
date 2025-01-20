import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader'

/**
 * 支持的3D模型文件类型
 */
export enum ModelFileType {
  FBX = 'FBX',
  GLTF = 'GLTF',
  GLB = 'GLB',
  OBJ = 'OBJ',
  STL = 'STL',
  DAE = 'DAE',
  UNKNOWN = 'UNKNOWN',
}

export interface TextureOptions {
  /** 是否开启纹理压缩 */
  textureCompression?: boolean
  /** 是否优化几何体 */
  optimizeGeometry?: boolean
}

/**
 * 模型加载器配置选项
 */
export interface LoaderOptions extends TextureOptions {
  /** 是否使用 Draco 压缩 (仅支持 GLTF/GLB) */
  useDraco?: boolean
  /** Draco 解码器路径 */
  dracoPath?: string
  /** 加载进度回调 */
  onProgress?: (event: ProgressEvent) => void
}

/**
 * 识别3D模型文件的类型
 * @param fileName - 模型文件名或URL
 * @returns 模型类型
 */
export function modelFileType(fileName: string): ModelFileType {
  const extension = fileName.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'fbx':
      return ModelFileType.FBX
    case 'glb':
      return ModelFileType.GLB
    case 'gltf':
      return ModelFileType.GLTF
    case 'obj':
      return ModelFileType.OBJ
    case 'stl':
      return ModelFileType.STL
    case 'dae':
      return ModelFileType.DAE
    default:
      console.warn(`无法识别的文件扩展名: ${extension}`)
      return ModelFileType.UNKNOWN
  }
}

/**
 * 根据文件类型获取对应的 Three.js Loader
 * @param fileType - 模型文件类型
 * @param options - 加载器配置选项
 * @returns 对应的 Three.js Loader 实例
 */
export function getLoaderByFileType(
  fileType: ModelFileType,
  options: LoaderOptions = {}
): THREE.Loader | null {
  const { useDraco = false, dracoPath = '/draco/' } = options

  try {
    switch (fileType) {
      case ModelFileType.FBX:
        return new FBXLoader()

      case ModelFileType.GLTF:
      case ModelFileType.GLB: {
        const loader = new GLTFLoader()
        if (useDraco) {
          const dracoLoader = new DRACOLoader()
          dracoLoader.setDecoderPath(dracoPath)
          loader.setDRACOLoader(dracoLoader)
        }
        return loader
      }

      case ModelFileType.OBJ:
        return new OBJLoader()

      case ModelFileType.STL:
        return new STLLoader()

      case ModelFileType.DAE:
        return new ColladaLoader()

      default:
        console.warn(`不支持的文件类型: ${fileType}`)
        return null
    }
  } catch (error) {
    console.error('创建加载器失败:', error)
    return null
  }
}

/**
 * 计算模型的边界信息
 * @param object - 3D对象
 * @returns 边界框信息，包含尺寸和中心点
 */
export function getModelBounds(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object)
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()

  box.getSize(size)
  box.getCenter(center)

  return {
    box,
    size,
    center,
    minY: box.min.y, // 模型最低点
    maxY: box.max.y, // 模型最高点
  }
}

/**
 * 计算模型合适的位置和缩放
 */
function computeModelTransform(object: THREE.Object3D) {
  const bounds = getModelBounds(object)
  const { size, center } = bounds

  // 获取模型的最大尺寸
  const maxSize = Math.max(size.x, size.y, size.z)

  // 计算合适的缩放比例
  const targetSize = 100
  const scale = targetSize / maxSize

  // 计算位置，使模型正好在地面上
  const position = new THREE.Vector3(
    -center.x * scale, // 水平居中
    -bounds.minY * scale, // 将模型底部对齐到 y=0
    -center.z * scale // 深度居中
  )

  return { position, scale }
}

/**
 * 处理模型材质
 */
function processModelMaterials(object: any): THREE.Group {
  let model: THREE.Group
  
  // 通过 object 的特征判断是否是 DAE 模型
  const isDaeModel = Boolean(
    object.kinematics || // DAE 模型特有的运动学属性
    object.library?.animations || // DAE 模型特有的动画库
    object.dae // 某些版本的 ColladaLoader 会添加这个标记
  )

  // 处理 GLTF/GLB/DAE 模型
  if (object.scene && object.scene instanceof THREE.Group) {
    model = object.scene
    if (object.animations?.length > 0) {
      model.animations = object.animations
    }

    // 处理材质
    model.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        if (isDaeModel) {
          // DAE 模型特定的材质处理
          child.material.flatShading = true
          child.material.needsUpdate = true
        }
        // 处理材质数组的情况（一个模型可能有多个材质）
        else if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            // MeshPhongMaterial 是 Collada 模型常用的材质类型
            if (mat instanceof THREE.MeshPhongMaterial) {
              // 设置光泽度，值越小越哑光，值越大越光亮
              mat.shininess = 30
              // 设置高光颜色，控制反射光的颜色和强度
              mat.specular.setRGB(0.2, 0.2, 0.2)
            }
          })
        } 
        // 处理单个材质的情况
        else if (child.material instanceof THREE.MeshPhongMaterial) {
          child.material.shininess = 30
          child.material.specular.setRGB(0.2, 0.2, 0.2)
        }
      }
    })
  }
  // 处理其他类型模型
  else if (object instanceof THREE.Group) {
    model = object
  }
  // 处理几何体
  else if (object instanceof THREE.BufferGeometry) {
    model = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      metalness: 0.5,
      roughness: 0.5,
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(object, material)

    // 优化几何体
    if (!object.attributes.normal) {
      object.computeVertexNormals()
    }
    if (!object.boundingSphere) {
      object.computeBoundingSphere()
    }
    if (!object.boundingBox) {
      object.computeBoundingBox()
    }

    mesh.castShadow = true
    mesh.receiveShadow = true
    model.add(mesh)
  }
  // 处理其他情况
  else {
    model = new THREE.Group()
    model.add(object)
  }

  // 计算并设置合适的位置和缩放
  const transform = computeModelTransform(model)
  model.position.copy(transform.position)
  model.scale.setScalar(transform.scale)

  // 设置阴影
  if (typeof model.traverse === 'function') {
    model.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }

  return model
}

/**
 * 加载模型
 */
export async function loadModel(
  url: string,
  scene: THREE.Scene,
  options: LoaderOptions = {}
): Promise<THREE.Group> {
  const fileType = modelFileType(url)
  const loader = getLoaderByFileType(fileType)

  if (!loader) {
    throw new Error(`不支持的文件类型: ${fileType}`)
  }

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      object => {
        try {
          const model = processModelMaterials(object)
          scene.add(model)
          resolve(model)
        } catch (error) {
          console.error('处理模型失败:', error)
          reject(error)
        }
      },
      options.onProgress,
      error => {
        console.error('加载模型失败:', error)
        reject(error)
      }
    )
  })
}
