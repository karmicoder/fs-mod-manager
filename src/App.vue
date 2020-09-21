<template>
  <div id="app" class="md-app md-app-side-drawer md-theme-default">
    <div class="md-content">
      <router-view />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App'
});
</script>
<style lang="scss"></style>
