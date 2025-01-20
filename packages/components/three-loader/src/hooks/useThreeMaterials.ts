import * as THREE from 'three'
import { ref, shallowRef } from 'vue'
import type { IMaterialOptions } from '../types/materials'
import { MaterialType } from '../types/materials'

/**
 * Three.js 材质管理 Hook
 */
export function useThreeMaterials() {
  // 存储模型的所有材质
  const materials = shallowRef<Map<string, THREE.Material>>(new Map())
  // 当前选中的材质
  const currentMaterial = shallowRef<THREE.Material | null>(null)
  // 材质列表
  const materialList = ref<IMaterialOptions[]>([])
  // 存储材质和网格的关联关系
  const materialMeshMap = new Map<string, THREE.Mesh[]>()
  // 存储网格的原始材质颜色
  const originalColors = new Map<string, {
    color: THREE.Color | null
    opacity: number
    transparent: boolean
    depthWrite: boolean
    emissive?: THREE.Color
    emissiveIntensity?: number
  }>()

  /**
   * 获取材质类型
   */
  const getMaterialType = (material: THREE.Material): MaterialType => {
    if (material instanceof THREE.MeshBasicMaterial) return MaterialType.Basic
    if (material instanceof THREE.MeshLambertMaterial) return MaterialType.Lambert
    if (material instanceof THREE.MeshPhongMaterial) return MaterialType.Phong
    if (material instanceof THREE.MeshStandardMaterial) return MaterialType.Standard
    if (material instanceof THREE.MeshPhysicalMaterial) return MaterialType.Physical
    if (material instanceof THREE.MeshToonMaterial) return MaterialType.Toon
    if (material instanceof THREE.MeshMatcapMaterial) return MaterialType.Matcap
    return MaterialType.Basic
  }

  /**
   * 提取模型中的材质
   */
  const extractMaterialsFromModel = (model: THREE.Object3D) => {
    try {
      const extractedMaterials = new Map<string, THREE.Material>()
      let meshCount = 0
      let materialCount = 0

      // 清空现有的映射
      materialMeshMap.clear()
      originalColors.clear()

      // 遍历模型
      model.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          meshCount++
          
          // 处理材质
          const materials = Array.isArray(node.material) ? node.material : [node.material]
          materials.forEach(material => {
            if (!material) return

            // 确保材质有名称
            if (!material.name) {
              material.name = `material_${materialCount++}`
            }

            // 存储材质
            if (!extractedMaterials.has(material.name)) {
              extractedMaterials.set(material.name, material)
              materialMeshMap.set(material.name, [node])

              // 打印材质信息
              console.log('提取材质:', {
                name: material.name,
                type: material.type,
                hasMap: 'map' in material && material.map !== null,
                mapInfo: 'map' in material && material.map ? {
                  image: material.map.image,
                  source: material.map.source,
                  uuid: material.map.uuid
                } : null
              })

              // 如果材质有贴图，确保贴图参数正确设置
              if ('map' in material && material.map) {
                material.map.colorSpace = THREE.SRGBColorSpace
                material.map.wrapS = THREE.RepeatWrapping
                material.map.wrapT = THREE.RepeatWrapping
                material.map.minFilter = THREE.LinearFilter
                material.map.magFilter = THREE.LinearFilter
                material.map.needsUpdate = true
                material.needsUpdate = true
              }
            } else {
              // 添加到已存在材质的网格列表中
              const meshes = materialMeshMap.get(material.name)
              if (meshes) {
                meshes.push(node)
              }
            }
          })
        }
      })

      // 更新材质映射
      materials.value = extractedMaterials

      console.log(`材质提取完成: 处理了 ${meshCount} 个网格，找到 ${extractedMaterials.size} 个材质`)
      
      // 更新材质列表
      updateMaterialList()
      
      return true
    } catch (error) {
      console.error('提取材质失败:', error)
      return false
    }
  }

  /**
   * 获取贴图URL
   */
  const getTextureUrl = (texture: THREE.Texture | null | undefined) => {
    if (!texture) return null
    
    try {
      // 尝试不同的方式获取贴图URL
      let url = null

      // 1. 尝试从 source.data 获取
      if (texture.source?.data?.src) {
        url = texture.source.data.src
      }
      // 2. 尝试从 image 获取
      else if (texture.image?.src) {
        url = texture.image.src
      }
      // 3. 如果 image 是 HTMLImageElement
      else if (texture.image instanceof HTMLImageElement) {
        url = texture.image.src
      }
      // 4. 如果 source.data 是 HTMLImageElement
      else if (texture.source?.data instanceof HTMLImageElement) {
        url = texture.source.data.src
      }
      // 5. 如果 image 是 ImageBitmap
      else if (texture.image instanceof ImageBitmap) {
        // 对于 ImageBitmap，我们需要创建一个临时的 canvas 来获取数据 URL
        const canvas = document.createElement('canvas')
        canvas.width = texture.image.width
        canvas.height = texture.image.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(texture.image, 0, 0)
          url = canvas.toDataURL('image/png')
        }
      }

      if (url) {
        console.log('获取到贴图URL:', url)
        return url
      }
      
      console.log('贴图存在但无法获取URL，贴图信息:', {
        hasImage: !!texture.image,
        imageType: texture.image ? texture.image.constructor.name : null,
        hasSource: !!texture.source,
        sourceType: texture.source ? texture.source.constructor.name : null,
        uuid: texture.uuid
      })
      return null
    } catch (error) {
      console.error('获取贴图URL失败:', error)
      return null
    }
  }

  /**
   * 更新材质列表
   */
  const updateMaterialList = () => {
    try {
      const list: IMaterialOptions[] = []
      materials.value.forEach((material, name) => {
        const materialOption: IMaterialOptions = {
          name,
          type: getMaterialType(material),
          opacity: material.opacity,
          transparent: material.transparent,
          wireframe: false,
          visible: material.visible,
          depthWrite: material.depthWrite,
          selected: false,
          meshNames: materialMeshMap.get(name)?.map(mesh => mesh.name) || [],
        }

        if (material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshPhongMaterial ||
            material instanceof THREE.MeshBasicMaterial ||
            material instanceof THREE.MeshLambertMaterial ||
            material instanceof THREE.MeshPhysicalMaterial ||
            material instanceof THREE.MeshToonMaterial ||
            material instanceof THREE.MeshMatcapMaterial) {
          
          // 基础属性
          materialOption.color = material.color?.getHex()
          materialOption.wireframe = material.wireframe
          materialOption.map = getTextureUrl(material.map)

          // Standard/Physical 材质特有属性
          if (material instanceof THREE.MeshStandardMaterial) {
            materialOption.roughness = material.roughness
            materialOption.metalness = material.metalness
            materialOption.normalMap = getTextureUrl(material.normalMap)
            materialOption.roughnessMap = getTextureUrl(material.roughnessMap)
            materialOption.metalnessMap = getTextureUrl(material.metalnessMap)
            materialOption.aoMap = getTextureUrl(material.aoMap)
            materialOption.emissiveMap = getTextureUrl(material.emissiveMap)
            materialOption.displacementMap = getTextureUrl(material.displacementMap)

            // Physical 材质额外属性
            if (material instanceof THREE.MeshPhysicalMaterial) {
              materialOption.clearcoat = material.clearcoat
              materialOption.clearcoatMap = getTextureUrl(material.clearcoatMap)
              materialOption.clearcoatRoughnessMap = getTextureUrl(material.clearcoatRoughnessMap)
              materialOption.clearcoatNormalMap = getTextureUrl(material.clearcoatNormalMap)
            }
          }

          // Phong 材质特有属性
          if (material instanceof THREE.MeshPhongMaterial) {
            materialOption.specular = material.specular?.getHex()
            materialOption.shininess = material.shininess
            materialOption.specularMap = getTextureUrl(material.specularMap)
          }

          // 通用贴图属性
          if ('bumpMap' in material) {
            materialOption.bumpMap = getTextureUrl(material.bumpMap)
          }
          if ('lightMap' in material) {
            materialOption.lightMap = getTextureUrl(material.lightMap)
          }
          if ('alphaMap' in material) {
            materialOption.alphaMap = getTextureUrl(material.alphaMap)
          }
        }

        list.push(materialOption)
        console.log('添加材质选项:', {
          name: materialOption.name,
          type: materialOption.type,
          maps: {
            基础贴图: materialOption.map,
            法线贴图: materialOption.normalMap,
            粗糙度贴图: materialOption.roughnessMap,
            金属度贴图: materialOption.metalnessMap,
            环境光遮蔽贴图: materialOption.aoMap,
            置换贴图: materialOption.displacementMap,
            发光贴图: materialOption.emissiveMap,
            清漆贴图: materialOption.clearcoatMap,
          }
        })
      })

      materialList.value = list
      console.log('材质列表更新完成，共', list.length, '个材质')
    } catch (error) {
      console.error('更新材质列表失败:', error)
    }
  }

  /**
   * 应用高亮效果到材质
   */
  const applyHighlight = (material: THREE.Material, highlight: boolean) => {
    try {
      // 使用鲜艳的红色作为高亮颜色（更亮更饱和）
      const highlightColor = new THREE.Color(0xff0000)  // 纯红色
      const highlightOpacity = 0.4  // 统一的透明度
      const highlightEmissive = new THREE.Color(0xff2222)  // 发光颜色

      // 存储原始状态
      if (!originalColors.has(material.uuid)) {
        const state: any = {
          color: material.color ? material.color.clone() : null,
          opacity: material.opacity,
          transparent: material.transparent,
          depthWrite: material.depthWrite
        }

        // 保存发光相关属性
        if (material instanceof THREE.MeshStandardMaterial || 
            material instanceof THREE.MeshPhongMaterial) {
          state.emissive = material.emissive.clone()
          state.emissiveIntensity = material.emissiveIntensity
        }

        originalColors.set(material.uuid, state)
      }

      const originalState = originalColors.get(material.uuid)
      
      if (highlight) {
        // 应用统一的高亮效果
        material.transparent = true
        material.opacity = highlightOpacity
        material.depthWrite = true

        // 设置发光效果（如果材质支持）
        if (material instanceof THREE.MeshStandardMaterial || 
            material instanceof THREE.MeshPhongMaterial) {
          material.emissive.copy(highlightEmissive)
          material.emissiveIntensity = 0.5
        }

        // 设置颜色（如果材质支持）
        if ('color' in material) {
          material.color.copy(highlightColor)
        }
      } else {
        // 恢复原始状态
        if (originalState) {
          material.transparent = originalState.transparent
          material.opacity = originalState.opacity
          material.depthWrite = originalState.depthWrite

          if ('color' in material && originalState.color) {
            material.color.copy(originalState.color)
          }

          // 恢复发光属性
          if ((material instanceof THREE.MeshStandardMaterial || 
               material instanceof THREE.MeshPhongMaterial) && 
              originalState.emissive) {
            material.emissive.copy(originalState.emissive)
            material.emissiveIntensity = originalState.emissiveIntensity
          }
        }
      }

      material.needsUpdate = true
    } catch (error) {
      console.error('应用高亮效果失败:', error)
    }
  }

  /**
   * 高亮显示使用指定材质的网格
   */
  const highlightMaterialMeshes = (materialName: string, highlight: boolean = true) => {
    try {
      console.log(`${highlight ? '高亮' : '取消高亮'}材质:`, materialName)
      const meshes = materialMeshMap.get(materialName)
      if (!meshes) {
        console.warn('未找到使用该材质的网格:', materialName)
        return
      }

      meshes.forEach(mesh => {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(material => {
            if (material.name === materialName) {
              applyHighlight(material, highlight)
            }
          })
        } else if (mesh.material.name === materialName) {
          applyHighlight(mesh.material, highlight)
        }
      })
    } catch (error) {
      console.error('高亮材质失败:', error)
    }
  }

  /**
   * 选择材质
   */
  const selectMaterial = (materialName: string) => {
    try {
      console.log('选择材质:', materialName)
      
      // 取消之前选中材质的高亮
      if (currentMaterial.value?.name && currentMaterial.value.name !== materialName) {
        console.log('取消之前材质的高亮:', currentMaterial.value.name)
        highlightMaterialMeshes(currentMaterial.value.name, false)
      }

      const material = materials.value.get(materialName)
      if (!material) {
        console.warn('未找到材质:', materialName)
        return null
      }

      currentMaterial.value = material
      
      // 高亮显示当前选中的材质
      highlightMaterialMeshes(materialName, true)

      // 更新材质列表中的选中状态
      materialList.value = materialList.value.map(m => ({
        ...m,
        selected: m.name === materialName
      }))

      return material
    } catch (error) {
      console.error('选择材质失败:', error)
      return null
    }
  }

  /**
   * 更新材质属性
   */
  const updateMaterialProperty = (materialName: string, property: string, value: any) => {
    const material = materials.value.get(materialName)
    if (!material) return

    try {
      switch (property) {
        case 'color':
          if ('color' in material) {
            material.color.setHex(value)
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
            material.wireframe = value
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
                      if (material.map) {
                        material.map.dispose()
                      }
                      material.map = texture
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
              if (material.map) {
                material.map.dispose()
              }
              material.map = null
              material.needsUpdate = true
            }
          }
          break
      }
      material.needsUpdate = true
      updateMaterialList()
    } catch (error) {
      console.error('更新材质属性失败:', error)
    }
  }

  /**
   * 切换材质可见性
   */
  const toggleMaterialVisibility = (materialName: string) => {
    const material = materials.value.get(materialName)
    if (material) {
      material.visible = !material.visible
      updateMaterialList()
    }
  }

  /**
   * 创建新材质
   */
  const createMaterial = (type: MaterialType, sourceMaterial?: THREE.Material): THREE.Material => {
    let material: THREE.Material;
    const baseProps = {
      color: sourceMaterial && 'color' in sourceMaterial ? sourceMaterial.color.getHex() : 0xffffff,
      opacity: sourceMaterial?.opacity ?? 1,
      transparent: sourceMaterial?.transparent ?? false,
      wireframe: sourceMaterial && 'wireframe' in sourceMaterial ? sourceMaterial.wireframe : false,
      map: sourceMaterial && 'map' in sourceMaterial ? sourceMaterial.map : null,
    }

    switch (type) {
      case MaterialType.Basic:
        material = new THREE.MeshBasicMaterial(baseProps)
        break
      case MaterialType.Lambert:
        material = new THREE.MeshLambertMaterial(baseProps)
        break
      case MaterialType.Phong:
        material = new THREE.MeshPhongMaterial({
          ...baseProps,
          specular: sourceMaterial instanceof THREE.MeshPhongMaterial ? sourceMaterial.specular.getHex() : 0x111111,
          shininess: sourceMaterial instanceof THREE.MeshPhongMaterial ? sourceMaterial.shininess : 30,
        })
        break
      case MaterialType.Standard:
        material = new THREE.MeshStandardMaterial({
          ...baseProps,
          roughness: sourceMaterial instanceof THREE.MeshStandardMaterial ? sourceMaterial.roughness : 0.5,
          metalness: sourceMaterial instanceof THREE.MeshStandardMaterial ? sourceMaterial.metalness : 0.5,
        })
        break
      case MaterialType.Physical:
        material = new THREE.MeshPhysicalMaterial({
          ...baseProps,
          roughness: sourceMaterial instanceof THREE.MeshPhysicalMaterial ? sourceMaterial.roughness : 0.5,
          metalness: sourceMaterial instanceof THREE.MeshPhysicalMaterial ? sourceMaterial.metalness : 0.5,
          clearcoat: sourceMaterial instanceof THREE.MeshPhysicalMaterial ? sourceMaterial.clearcoat : 0,
        })
        break
      case MaterialType.Toon:
        material = new THREE.MeshToonMaterial(baseProps)
        break
      case MaterialType.Matcap:
        material = new THREE.MeshMatcapMaterial(baseProps)
        break
      default:
        material = new THREE.MeshBasicMaterial(baseProps)
    }

    // 复制通用属性
    if (sourceMaterial) {
      material.name = sourceMaterial.name
      material.visible = sourceMaterial.visible
      material.depthWrite = sourceMaterial.depthWrite
      if ('emissive' in material && 'emissive' in sourceMaterial) {
        material.emissive = sourceMaterial.emissive.clone()
        material.emissiveIntensity = sourceMaterial.emissiveIntensity
      }
    }

    return material
  }

  /**
   * 转换材质类型
   */
  const convertMaterialType = (materialName: string, newType: MaterialType) => {
    try {
      // 如果是更新所有材质
      if (materialName === 'all') {
        materials.value.forEach((material, name) => {
          const newMaterial = createMaterial(newType, material)
          newMaterial.name = name

          // 更新场景中使用该材质的所有网格
          const meshes = materialMeshMap.get(name)
          if (meshes) {
            meshes.forEach(mesh => {
              if (Array.isArray(mesh.material)) {
                // 处理多材质情况
                const index = mesh.material.findIndex(m => m.name === name)
                if (index !== -1) {
                  mesh.material[index] = newMaterial
                }
              } else if (mesh.material.name === name) {
                mesh.material = newMaterial
              }
            })
          }

          // 更新材质映射
          materials.value.set(name, newMaterial)
        })

        // 更新材质列表
        updateMaterialList()
        console.log('所有材质已转换为:', newType)
        return
      }

      // 更新单个材质
      const oldMaterial = materials.value.get(materialName)
      if (!oldMaterial) {
        console.warn(`未找到材质: ${materialName}`)
        return
      }

      const newMaterial = createMaterial(newType, oldMaterial)
      newMaterial.name = materialName

      // 更新场景中使用该材质的所有网格
      const meshes = materialMeshMap.get(materialName)
      if (meshes) {
        meshes.forEach(mesh => {
          if (Array.isArray(mesh.material)) {
            // 处理多材质情况
            const index = mesh.material.findIndex(m => m.name === materialName)
            if (index !== -1) {
              mesh.material[index] = newMaterial
            }
          } else if (mesh.material.name === materialName) {
            mesh.material = newMaterial
          }
        })
      }

      // 更新材质映射
      materials.value.set(materialName, newMaterial)
      
      // 更新材质列表
      updateMaterialList()
      console.log(`材质 ${materialName} 已转换为:`, newType)

    } catch (error) {
      console.error('转换材质类型失败:', error)
    }
  }

  return {
    materials,
    currentMaterial,
    materialList,
    extractMaterialsFromModel,
    selectMaterial,
    updateMaterialProperty,
    toggleMaterialVisibility,
    convertMaterialType,
  }
} 