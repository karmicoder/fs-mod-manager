<template>
  <v-stepper class="import" v-model="step">
    <v-stepper-header>
      <v-stepper-step :complete="step > 1" step="1">Select File</v-stepper-step>
      <v-divider />
      <v-stepper-step :complete="step > 2" step="2">Extract</v-stepper-step>
      <v-divider />
      <v-stepper-step step="3">Select Packages</v-stepper-step>
      <v-divider />
      <v-stepper-step step="4">Install Packages</v-stepper-step>
    </v-stepper-header>
    <v-stepper-items>
      <v-stepper-content step="1">
        <h1 class="text-center">Import File</h1>
        <div>
          Select a zip file that contains one or more packages to import
        </div>
        <v-btn color="primary" class="centered" @click="selectArchive"
          >Choose File</v-btn
        >
        <br />
      </v-stepper-content>
      <v-stepper-content step="2">
        <span v-if="!importInfo"
          >Extracting files {{ this.archivePath }}...</span
        >
        <v-progress-linear indeterminate />
      </v-stepper-content>
      <v-stepper-content step="3">
        <PackageList v-if="importInfo" :packages="importPackages" />
        <v-btn color="green" @click="install">
          <v-icon @click="install">mdi-file-import</v-icon> Install
        </v-btn>
        <pre v-if="importPackages">{{
          JSON.stringify(importInfo, null, 2)
        }}</pre>
      </v-stepper-content>
      <v-stepper-content step="4">
        <h1>Install Successful</h1>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>
<script lang="ts">
import { clearPackageInfo, ImportInfo, PackageInfo } from '@/data/packageInfo';
import { selectImportFile, parseImportFile, importPackages } from '@/ipc';
import Vue from 'vue';
import PackageList from '@/components/packageList.vue';

export default Vue.extend({
  name: 'Import',
  components: {
    PackageList
  },
  data() {
    return {
      step: 1,
      archivePath: undefined as string | undefined,
      importInfo: undefined as ImportInfo | undefined
    };
  },
  methods: {
    selectArchive() {
      selectImportFile().then((path) => {
        if (path && path !== '') {
          this.archivePath = path;
          this.step = 2;
        }
      });
    },
    install() {
      if (this.importInfo) {
        importPackages(this.importInfo.packages).then(() => {
          clearPackageInfo();
          this.step = 4;
        });
      }
    }
  },
  computed: {
    importPackages(): PackageInfo[] | undefined {
      return this.importInfo?.packages.map((p) => p[1]);
    }
  },
  watch: {
    step: function(newVal) {
      if (newVal === 2 && this.archivePath) {
        parseImportFile(this.archivePath).then((importInfo) => {
          this.importInfo = importInfo;
          this.step = 3;
        });
      }
    }
  }
});
</script>
<style lang="scss">
.import {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  > .v-stepper__content > .v-stepper__wrapper {
    > .v-card {
      flex-grow: 1;
    }
  }
}
</style>
