<template>
  <div class="setup">
    <h1>Setup</h1>
    <p>MSFS install path: {{ msfsInstallPath }}</p>
    <v-btn
      depressed
      color="primary"
      :disabled="msfsInstallPath === ''"
      @click="goToPackages"
    >
      Confirm
    </v-btn>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { findMsfsInstallPath } from '@/ipcRenderer';

// ipcRenderer.
export default Vue.extend({
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
