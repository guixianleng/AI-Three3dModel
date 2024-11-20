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
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

#app {
  height: 100%;
}

/* .el-main {
  padding: 0;
  margin: 0;
} */
</style> 