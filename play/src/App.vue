<template>
  <el-container class="h-screen">
    <el-main class="p-0 m-0">
      <Home />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import Home from './views/Home.vue'
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
}

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