import type { Component, App } from "vue"

import ThreeLoader from "./three-loader"

const components: {
  [propName: string]: Component
} = {
  ThreeLoader,
}

const install = (app: App) => {
  for (const key in components) {
    app.component(key, components[key])
  }
}

// @ts-ignore
if (typeof window !== "undefined" && window.Vue) {
  // @ts-ignore
  install(window.Vue)
}

// 按需引入
export {
  ThreeLoader,
}

export default { install }
