<template>
  <el-container class="h-screen">
    <el-main class="p-0 m-0">
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
// 移除所有不需要的导入
</script>

<style scoped>
.el-main {
  overflow-x: hidden;
  padding: 0;
  margin: 0;
}

:deep(.el-main) {
  padding: 0;
  margin: 0;
}
</style> 