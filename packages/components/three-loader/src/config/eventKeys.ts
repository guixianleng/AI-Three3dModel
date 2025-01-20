import type { InjectionKey } from 'vue'
import type { IPosition } from '../types/positions'
import type { BackgroundUpdateOptions } from '../types/scene'
import type { IControlsOptions } from '../types/controls'
import type { IMaterialUpdateOptions } from '../types/materials'
import type { MaterialType } from '../types/materials'

export interface SceneEvents {
  resetView: () => void
  takeScreenshot: () => void
  startAnimation: () => void
  pauseAnimation: () => void
  resetAnimation: () => void
  toggleGrid: (show: boolean) => void
  toggleStats: (show: boolean) => void
  toggleAxes: (show: boolean) => void
  toggleFloor: (show: boolean) => void
  updateFloorColor: (color: string) => void
  updateFloorOpacity: (opacity: number) => void
  lightChange: (lightType: string, property: string, value: any) => void
  updateModelPosition: (axis: string, value: number) => void
  updateGridColor: (color: string) => void
  updateModelRotation: (axis: string, value: number) => void
  updateBackground: (color: string, opacity: number) => void
  updateControlsOptions: (options: Partial<IControlsOptions>) => void
  updateMaterial: (options: IMaterialUpdateOptions) => void
  convertMaterial: (materialName: string, type: MaterialType) => void
}

export const SCENE_EVENTS_KEY = Symbol('scene-events')
