<template>
  <div class="setup">
    <h1>Setup</h1>
    <p>MSFS install path: {{ msfsInstallPath }}</p>
    <button
      class="btn btn-primary"
      :disabled="msfsInstallPath === ''"
      @click="goToPackages"
    >
      Confirm
    </button>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { findMsfsInstallPath } from '@/ipc';

// ipcRenderer.
export default defineComponent({
  data() {
    return {
      msfsInstallPath: ''
    };
  },
  methods: {
    goToPackages() {
      this.$router.push('/packages');
    }
  },
  created() {
    findMsfsInstallPath().then((path) => (this.msfsInstallPath = path));
  }
});
</script>
