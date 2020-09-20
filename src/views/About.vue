<template>
  <div class="about">
    <h1>This is an about page</h1>
    <p>MSFS install path: {{ msfsInstallPath }}</p>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { findMsfsInstallPath } from '@/ipc';

// ipcRenderer.
export default defineComponent({
  data() {
    return {
      msfsInstallPath: 'checking...'
    };
  },
  created() {
    findMsfsInstallPath().then((path) => (this.msfsInstallPath = path));
  }
});
</script>
