/**
 * 材质类型枚举
 */
export enum MaterialType {
  Basic = 'MeshBasicMaterial',
  Lambert = 'MeshLambertMaterial',
  Phong = 'MeshPhongMaterial',
  Standard = 'MeshStandardMaterial',
  Physical = 'MeshPhysicalMaterial',
  Toon = 'MeshToonMaterial',
  Matcap = 'MeshMatcapMaterial',
}

/**
 * 材质类型显示名称映射
 */
export const MaterialTypeNames: Record<MaterialType, string> = {
  [MaterialType.Basic]: '基础网格材质(默认材质)',
  [MaterialType.Lambert]: 'Lambert网格材质(漫反射)',
  [MaterialType.Phong]: 'Phong网格材质(高光)',
  [MaterialType.Standard]: '标准网格材质(PBR)',
  [MaterialType.Physical]: '物理网格材质(高级PBR)',
  [MaterialType.Toon]: '卡通着色材质(卡通)',
  [MaterialType.Matcap]: 'Matcap材质(预烘焙)',
}

/**
 * 材质配置选项接口
 */
export interface IMaterialOptions {
  /** 材质名称 */
  name: string
  /** 材质类型 */
  type: MaterialType
  /** 材质颜色 */
  color?: number
  /** 不透明度 */
  opacity: number
  /** 是否透明 */
  transparent: boolean
  /** 是否显示线框 */
  wireframe: boolean
  /** 是否启用深度写入 */
  depthWrite: boolean
  /** 是否可见 */
  visible: boolean
  /** 是否选中 */
  selected: boolean
  /** 关联的网格名称列表 */
  meshNames: string[]

  // 基础贴图
  /** 颜色贴图 */
  map: string | null
  /** 透明度贴图 */
  alphaMap?: string | null
  /** 环境光遮蔽贴图 */
  aoMap?: string | null
  /** 凹凸贴图 */
  bumpMap?: string | null
  /** 光照贴图 */
  lightMap?: string | null
  
  // Standard/Physical 材质特有属性
  /** 粗糙度 */
  roughness?: number
  /** 金属度 */
  metalness?: number
  /** 法线贴图 */
  normalMap?: string | null
  /** 粗糙度贴图 */
  roughnessMap?: string | null
  /** 金属度贴图 */
  metalnessMap?: string | null
  /** 发光贴图 */
  emissiveMap?: string | null
  /** 置换贴图 */
  displacementMap?: string | null

  // Physical 材质特有属性
  /** 清漆层 */
  clearcoat?: number
  /** 清漆贴图 */
  clearcoatMap?: string | null
  /** 清漆粗糙度贴图 */
  clearcoatRoughnessMap?: string | null
  /** 清漆法线贴图 */
  clearcoatNormalMap?: string | null

  // Phong 材质特有属性
  /** 高光颜色 */
  specular?: number
  /** 高光强度 */
  shininess?: number
  /** 高光贴图 */
  specularMap?: string | null

  // 通用属性
  /** 发光颜色 */
  emissive?: number
  /** 发光强度 */
  emissiveIntensity?: number
}

/**
 * 材质更新选项接口
 */
export interface IMaterialUpdateOptions {
  /** 材质名称 */
  name: string
  /** 要更新的属性 */
  property: string
  /** 属性值 */
  value: any
} 