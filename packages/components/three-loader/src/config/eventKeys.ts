import type { IPosition } from '../types/positions'
import { BackgroundType } from '../config/helperConfig'

interface BackgroundUpdate {
  type: BackgroundType
  value: string
}

export const SCENE_EVENTS_KEY = Symbol('sceneEvents')

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
  updateBackgroundColor: (color: string) => void
  scaleChange: (value: number) => void
  lightChange: (lightType: string, property: string, value: any) => void
  updateModelPosition: (position: IPosition) => void
  updateGridColor: (color: string) => void
  updateModelRotation: (rotation: IPosition) => void
  updateBackground: (background: BackgroundUpdate) => void
} 