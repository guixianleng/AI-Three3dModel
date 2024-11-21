import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

/**
 * 支持的3D模型文件类型
 */
export enum ModelFileType {
  FBX = 'FBX',
  GLTF = 'GLTF',
  GLB = 'GLB',
  OBJ = 'OBJ',
  STL = 'STL',
  UNKNOWN = 'UNKNOWN'
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
export function getLoaderByFileType(fileType: ModelFileType, options: LoaderOptions = {}): THREE.Loader | null {
  const { useDraco = false, dracoPath = '/draco/', textureCompression = false } = options

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
 * 处理模型材质
 * @param object - THREE.Object3D 实例
 * @param options - 材质处理选项
 */
export function processModelMaterials(object: THREE.Object3D, options: TextureOptions = {}) {
  const { textureCompression = false, optimizeGeometry = true } = options

  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // 处理材质
      if (child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach(mat => {
          // 创建新的 MeshPhongMaterial
          const newMat = new THREE.MeshPhongMaterial({
            color: mat.color || 0xffffff,
            map: textureCompression ? compressTexture(mat.map) : mat.map,
            normalMap: textureCompression ? compressTexture(mat.normalMap) : mat.normalMap,
            aoMap: textureCompression ? compressTexture(mat.aoMap) : mat.aoMap,
            aoMapIntensity: 1.0,
            emissive: mat.emissive || 0x000000,
            emissiveMap: textureCompression ? compressTexture(mat.emissiveMap) : mat.emissiveMap,
            emissiveIntensity: 1.0,
            specular: 0x444444,
            shininess: 30,
            reflectivity: 1,
            side: THREE.DoubleSide,
            transparent: mat.transparent || false,
            opacity: mat.opacity !== undefined ? mat.opacity : 1.0
          })

          // 确保材质更新
          newMat.needsUpdate = true

          // 应用新材质
          if (!Array.isArray(child.material)) {
            child.material = newMat
          }
        })
      }

      // 设置阴影
      child.castShadow = true
      child.receiveShadow = true

      // 优化几何体
      if (optimizeGeometry && child.geometry) {
        optimizeGeometryBuffers(child.geometry)
      }
    }
  })
}

/**
 * 压缩纹理
 * @param texture - THREE.Texture 实例
 * @returns 压缩后的纹理
 */
function compressTexture(texture: THREE.Texture | null): THREE.Texture | null {
  if (!texture) return null

  try {
    // 设置纹理压缩格式
    texture.format = THREE.RGBAFormat
    texture.type = THREE.UnsignedByteType
    
    // 设置纹理过滤
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    
    // 启用各向异性过滤
    const maxAnisotropy = THREE.WebGLRenderer ? THREE.WebGLRenderer.capabilities?.getMaxAnisotropy() : 1
    if (maxAnisotropy) {
      texture.anisotropy = maxAnisotropy
    }

    // 生成 mipmap
    texture.generateMipmaps = true
    texture.needsUpdate = true

    return texture
  } catch (error) {
    console.error('压缩纹理失败:', error)
    return texture
  }
}

/**
 * 优化几何体缓冲区
 * @param geometry - THREE.BufferGeometry 实例
 */
function optimizeGeometryBuffers(geometry: THREE.BufferGeometry): void {
  try {
    // 检查是否有必要的属性
    const hasRequiredAttributes = geometry.attributes.position 
      && geometry.attributes.normal 
      && geometry.attributes.uv 
      && geometry.index;

    // 计算法线
    if (geometry.attributes.position && !geometry.attributes.normal) {
      geometry.computeVertexNormals();
    }

    // 只在有必要的属性时计算切线
    if (hasRequiredAttributes) {
      try {
        geometry.computeTangents();
      } catch (error) {
        console.warn('计算切线失败，跳过此步骤:', error);
      }
    }

    // 计算包围盒和包围球
    if (geometry.attributes.position) {
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
    }

    // mergeVertices 在 BufferGeometry 中不可用，需要使用其他方式优化
    // 可以考虑使用 BufferGeometryUtils
    /*
    if (THREE.BufferGeometryUtils && THREE.BufferGeometryUtils.mergeVertices) {
      geometry = THREE.BufferGeometryUtils.mergeVertices(geometry);
    }
    */

    // 居中几何体
    geometry.center();

    // 标记需要更新
    if (geometry.attributes.position) {
      geometry.attributes.position.needsUpdate = true;
    }
    if (geometry.attributes.normal) {
      geometry.attributes.normal.needsUpdate = true;
    }
    if (geometry.attributes.uv) {
      geometry.attributes.uv.needsUpdate = true;
    }

    console.log('几何体优化完成', {
      hasPosition: !!geometry.attributes.position,
      hasNormal: !!geometry.attributes.normal,
      hasUV: !!geometry.attributes.uv,
      hasIndex: !!geometry.index
    });
  } catch (error) {
    console.error('优化几何体失败:', error);
  }
}

/**
 * 加载模型并处理材质
 * @param url - 模型文件的URL
 * @param scene - THREE.Scene 实例
 * @param options - 加载器配置选项
 * @returns Promise<THREE.Object3D> - 加载的模型对象
 */
export async function loadModel(
  url: string,
  scene: THREE.Scene,
  options: LoaderOptions = {}
): Promise<THREE.Object3D> {
  const fileType = modelFileType(url)
  const loader = getLoaderByFileType(fileType, options)

  if (!loader) {
    throw new Error(`无法加载模型，文件类型不支持: ${fileType}`)
  }

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (object) => {
        try {
          processModelMaterials(object, {
            textureCompression: options.textureCompression,
            optimizeGeometry: options.optimizeGeometry
          })
          scene.add(object)
          console.log(`模型加载成功: ${url}`)
          resolve(object)
        } catch (error) {
          console.error('处理模型失败:', error)
          reject(error)
        }
      },
      (event) => {
        // 处理加载进度
        if (options.onProgress) {
          options.onProgress(event)
        }
      },
      (error) => {
        console.error(`模型加载失败: ${error}`)
        reject(error)
      }
    )
  })
} 