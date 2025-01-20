# Three-3D-editor

## 项目结构

```bash
packages/
├── components/               # 组件目录
│   └── three-loader/        # Three.js 加载器组件
│       ├── src/
│       │   ├── components/  # 子组件
│       │   │   ├── controls/       # 控制面板组件
│       │   │   │   ├── ModelControls.vue    # 模型控制主组件
│       │   │   │   ├── MaterialControls.vue # 材质控制组件
│       │   │   │   └── ...
│       │   ├── config/     # 配置文件
│       │   │   ├── eventKeys.ts   # 事件配置
│       │   │   └── ...
│       │   ├── hooks/      # 自定义钩子
│       │   │   ├── useThreeScene.ts     # 场景管理
│       │   │   ├── useThreeModel.ts     # 模型管理
│       │   │   ├── useThreeMaterials.ts # 材质管理
│       │   │   ├── useThreeControls.ts  # 控制器管理
│       │   │   └── ...
│       │   ├── types/      # 类型定义
│       │   │   ├── materials.ts    # 材质相关类型
│       │   │   ├── controls.ts     # 控制器相关类型
│       │   │   └── ...
│       │   └── index.vue   # 主组件
└── utils/                   # 工具函数
    └── ...

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **3D 引擎**: Three.js r150+
- **构建工具**: Vite
- **UI 框架**: Element Plus
- **样式方案**: UnoCSS
- **状态管理**: Vue Composition API

## 核心功能模块

### 1. 场景管理 (useThreeScene)
```typescript
const {
  scene,          // Three.js 场景实例
  camera,         // 相机实例
  renderer,       // 渲染器实例
  controls,       // 控制器实例
  initScene,      // 初始化场景
  updateScene,    // 更新场景
  disposeScene    // 销毁场景
} = useThreeScene()
```

### 2. 模型管理 (useThreeModel)
```typescript
const {
  model,           // 当前模型实例
  loadModel,       // 加载模型
  updateModel,     // 更新模型
  disposeModel,    // 销毁模型
  modelControls    // 模型控制参数
} = useThreeModel()
```

### 3. 材质管理 (useThreeMaterials)
```typescript
const {
  materials,       // 材质映射表
  materialList,    // 材质列表
  currentMaterial, // 当前选中材质
  selectMaterial,  // 选择材质
  updateMaterialProperty,  // 更新材质属性
  convertMaterialType     // 转换材质类型
} = useThreeMaterials()
```

### 4. 控制器管理 (useThreeControls)
```typescript
const {
  initControls,    // 初始化控制器
  updateControls,  // 更新控制器
  resetControls    // 重置控制器
} = useThreeControls()
```

## 事件系统

### 场景事件
```typescript
interface SceneEvents {
  // 更新材质
  updateMaterial: (options: IMaterialUpdateOptions) => void
  // 更新控制器
  updateControls: (options: Partial<IControlsOptions>) => void
  // 更新灯光
  updateLight: (options: Partial<ILightOptions>) => void
  // 更新地面
  updateFloor: (options: Partial<IFloorOptions>) => void
}
```

## 组件通信

### 1. Props 传递
```typescript
// ModelControls.vue Props
interface Props {
  modelControls: IModelControls       // 模型控制参数
  materialList: IMaterialOptions[]    // 材质列表
  updateMaterial: (options: IMaterialUpdateOptions) => void
}
```

### 2. 事件发送
```typescript
// 材质更新事件
emit('update-material', {
  name: materialName,
  property: 'color',
  value: 0xff0000
})
```

## 开发指南

### 1. 环境准备
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 2. 新增材质类型
1. 在 `types/materials.ts` 中添加新材质类型
2. 在 `useThreeMaterials.ts` 中实现材质创建逻辑
3. 在 `MaterialControls.vue` 中添加对应的 UI 控制项

### 3. 添加新的控制功能
1. 在相应的类型定义文件中添加新的配置项
2. 在对应的 hook 中实现功能逻辑
3. 在控制面板组件中添加 UI 控制项
4. 在事件系统中添加相应的处理方法

## 性能优化

### 1. 材质管理
- 使用材质缓存避免重复创建
- 及时释放未使用的材质和纹理
- 批量更新材质属性

### 2. 渲染优化
- 使用 `requestAnimationFrame` 进行渲染
- 仅在需要时更新场景
- 优化模型几何体

### 3. 内存管理
- 正确调用 `dispose()` 方法释放资源
- 使用 `WeakMap` 存储临时数据
- 及时清理不再使用的引用

## 调试与测试

### 1. 开发调试
- 使用 Vue DevTools 调试组件
- 使用 Three.js Inspector 调试场景
- 控制台日志输出关键信息

### 2. 性能监控
- 使用 Stats.js 监控帧率
- 监控内存使用情况
- 跟踪材质和纹理数量

## 部署说明

### 1. 构建
```bash
# 构建生产版本
pnpm build
```