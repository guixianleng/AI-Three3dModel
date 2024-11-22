import type { InjectionKey } from 'vue'
import type { IPosition } from '../types/positions'
import type { BackgroundUpdateOptions } from '../types/scene'

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
  updateFloorColor: (color: string | number) => void
  updateFloorOpacity: (opacity: number) => void
  lightChange: (lightType: string, property: string, value: any) => void
  updateModelPosition: (position: IPosition) => void
  updateGridColor: (color: string) => void
  updateModelRotation: (rotation: IPosition) => void
  updateBackground: (background: BackgroundUpdateOptions) => void
}

export const SCENE_EVENTS_KEY = Symbol() as InjectionKey<SceneEvents> 