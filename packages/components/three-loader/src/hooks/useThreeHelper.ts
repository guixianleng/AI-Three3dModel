import * as THREE from 'three'
import { ref, markRaw } from 'vue'
import Stats from 'three/examples/jsm/libs/stats.module'
import type { IHelperOptions } from '../types/scene'
import { defaultModelConfig } from '../config/modelConfig'

/**
 * Three.js 场景辅助工具管理 Hook
 */
export function useThreeHelper(options: IHelperOptions = defaultModelConfig.helperConfig) {
  // 解构配置选项并设置默认值
  const {
    grid: { show: showGrid, size: gridSize, divisions: gridDivisions, color: gridColor },
    axes: { show: showAxes, size: axesSize },
    floor: { show: showFloor, color: floorColor, opacity: floorOpacity },
    stats: { show: showStats }
  } = options

  // 辅助工具引用
  const stats = ref<Stats | null>(null)
  const gridHelper = ref<THREE.GridHelper | null>(null)
  const axesHelper = ref<THREE.AxesHelper | null>(null)
  const floor = ref<THREE.Mesh | null>(null)

  /**
   * 创建地板
   */
  const createFloorMesh = () => {
    try {
      const geometry = markRaw(new THREE.PlaneGeometry(gridSize, gridSize))
      const material = markRaw(new THREE.MeshStandardMaterial({ 
        color: floorColor,        // 材质的基本颜色
        roughness: 0.8,           // 材质的粗糙度，0表示镜面反射，1表示完全漫反射
        metalness: 0.2,           // 材质的金属度，0表示非金属材质，1表示金属材质
        transparent: true,        // 是否开启透明
        opacity: floorOpacity,    // 使用配置的透明度
        side: THREE.DoubleSide,   // 渲染面片的正反面
        depthWrite: false         // 禁用深度写入，避免透明物体的渲染问题
      }))
      const floorMesh = markRaw(new THREE.Mesh(geometry, material))
      
      // 确保地板位于 y=0 平面，并且朝上
      floorMesh.rotation.x = -Math.PI / 2
      floorMesh.position.y = 0
      floorMesh.receiveShadow = true
      floorMesh.visible = showFloor
      // 添加名称以便后续查找
      floorMesh.name = 'floor'
      
      return floorMesh
    } catch (error) {
      console.error('创建地板失败:', error)
      return null
    }
  }

  /**
   * 创建网格辅助线
   */
  const createGridHelper = () => {
    try {
      const grid = markRaw(new THREE.GridHelper(gridSize, gridDivisions, gridColor, gridColor))
      grid.position.y = 0.1
      grid.visible = showGrid
      grid.name = 'GridHelper'
      return grid
    } catch (error) {
      console.error('创建网格辅助线失败:', error)
      return null
    }
  }

  /**
   * 创建坐标轴辅助线
   */
  const createAxesHelper = () => {
    try {
      const axes = markRaw(new THREE.AxesHelper(axesSize))
      axes.visible = showAxes
      return axes
    } catch (error) {
      console.error('创建坐标轴辅助线失败:', error)
      return null
    }
  }

  /**
   * 创建地板和辅助工具
   */
  const createFloor = (scene: THREE.Scene) => {
    if (!scene) {
      console.warn('创建辅助工具失败: 场景未初始化')
      return
    }

    try {
      // 创建并添加地板
      const floorMesh = createFloorMesh()
      if (floorMesh) {
        scene.add(floorMesh)
        floor.value = floorMesh
      }

      // 创建并添加网格辅助线
      const grid = createGridHelper()
      if (grid) {
        scene.add(grid)
        gridHelper.value = grid
      }

      // 创建并添加坐标轴辅助线
      const axes = createAxesHelper()
      if (axes) {
        scene.add(axes)
        axesHelper.value = axes
      }

      console.log('辅助工具创建完成', {
        floor: !!floor.value,
        grid: !!gridHelper.value,
        axes: !!axesHelper.value
      })
    } catch (error) {
      console.error('创建辅助工具失败:', error)
    }
  }

  /**
   * 创建性能监控器
   */
  const createStats = (container: HTMLElement) => {
    if (!container || !showStats) return

    try {
      const newStats = new Stats()
      newStats.dom.style.cssText = 'position: absolute; top: 0; left: 0;'
      container.appendChild(newStats.dom)
      stats.value = markRaw(newStats)
    } catch (error) {
      console.error('创建性能监控器失败:', error)
    }
  }

  /**
   * 切换网格显示状态
   */
  const toggleGrid = (scene: THREE.Scene, show: boolean) => {
    if (!scene || !gridHelper.value) {
      console.warn('切换网格显示失败: 场景或网格未初始化')
      return
    }
    gridHelper.value.visible = show
  }

  /**
   * 更新网格颜色
   */
  const updateGridColor = (scene: THREE.Scene, color: string) => {
    if (!scene || !gridHelper.value) {
      console.warn('更改网格颜色失败: 场景或网格未初始化')
      return
    }
    gridHelper.value.material.color.set(color)
  }

  /**
   * 切换坐标轴显示状态
   */
  const toggleAxes = (scene: THREE.Scene, show: boolean) => {
    if (!scene || !axesHelper.value) {
      console.warn('切换坐标轴显示失败: 场景或坐标轴未初始化')
      return
    }
    axesHelper.value.visible = show
  }

  /**
   * 切换地板显示状态
   */
  const toggleFloor = (scene: THREE.Scene, show: boolean) => {
    if (!scene || !floor.value) {
      console.warn('切换地板显示失败: 场景或地板未初始化')
      return
    }
    floor.value.visible = show
  }

  /**
   * 切换性能监控显示状态
   */
  const toggleStats = (container: HTMLElement, show: boolean) => {
    if (!container) {
      console.warn('切换性能监控失败: 容器未找到')
      return
    }

    try {
      if (show && !stats.value) {
        createStats(container)
      } else if (!show && stats.value) {
        container.removeChild(stats.value.dom)
        stats.value = null
      }
    } catch (error) {
      console.error('切换性能监控显示状态失败:', error)
    }
  }

  /**
   * 更新地板颜色
   */
  const updateFloorColor = (color: number | string) => {
    if (!floor.value) {
      console.warn('更新地板颜色失败: 地板未初始化')
      return
    }

    try {
      if (floor.value.material instanceof THREE.MeshStandardMaterial) {
        floor.value.material.color.set(color)
        floor.value.material.needsUpdate = true
        console.log('地板颜色已更新:', color)
      }
    } catch (error) {
      console.error('更新地板颜色失败:', error)
    }
  }

  /**
   * 更新性能监控
   */
  const updateStats = () => {
    if (stats.value) {
      stats.value.update()
    }
  }

  /**
   * 清理资源
   */
  const dispose = (container: HTMLElement | undefined, scene: THREE.Scene | null) => {
    try {
      // 移除性能监控
      if (container && stats.value) {
        container.removeChild(stats.value.dom)
        stats.value = null
      }

      if (scene) {
        // 移除网格辅助线
        if (gridHelper.value) {
          scene.remove(gridHelper.value)
          gridHelper.value = null
        }

        // 移除坐标轴辅助线
        if (axesHelper.value) {
          scene.remove(axesHelper.value)
          axesHelper.value = null
        }

        // 移除地板
        if (floor.value) {
          if (floor.value.material instanceof THREE.Material) {
            floor.value.material.dispose()
          }
          if (floor.value.geometry) {
            floor.value.geometry.dispose()
          }
          scene.remove(floor.value)
          floor.value = null
        }
      }

      console.log('辅助工具资源已清理')
    } catch (error) {
      console.error('清理辅助工具资源失败:', error)
    }
  }

  /**
   * 更新地板透明度
   */
  const updateFloorOpacity = (opacity: number) => {
    if (!floor.value) return
    
    const material = floor.value.material as THREE.MeshStandardMaterial
    if (material) {
      material.opacity = Math.max(0, Math.min(1, opacity)) // 确保透明度在 0-1 之间
      material.needsUpdate = true
    }
  }

  return {
    stats,
    gridHelper,
    axesHelper,
    floor,
    createFloor,
    createStats,
    toggleGrid,
    updateGridColor,
    toggleStats,
    toggleAxes,
    toggleFloor,
    updateStats,
    updateFloorColor,
    updateFloorOpacity,
    dispose,
  }
} 