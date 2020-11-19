<template>
  <v-stepper class="import elevation-0" v-model="step">
    <v-stepper-header class="elevation-0">
      <v-stepper-step :complete="step > 1" step="1">Select File</v-stepper-step>
      <v-divider />
      <v-stepper-step :complete="step > 2" step="2">Extract</v-stepper-step>
      <v-divider />
      <v-stepper-step step="3">Select Packages</v-stepper-step>
      <v-divider />
      <v-stepper-step step="4">Install Packages</v-stepper-step>
    </v-stepper-header>
    <v-stepper-items>
      <v-stepper-content step="1" class="elevation-0">
        <h1 class="text-center">Import File</h1>
        <div>
          Select a zip file that contains one or more packages to import
        </div>
        <v-btn color="primary" class="centered" @click="selectArchive"
          >Choose File</v-btn
        >
        <br />
      </v-stepper-content>
      <v-stepper-content step="2" class="elevation-0">
        <span v-if="!importInfo"
          >Extracting files {{ archivePaths && archivePaths.join(', ') }}...
          {{ unarchiveProgress }}&percnt;</span
        >
        <v-progress-linear v-model="unarchiveProgress" />
      </v-stepper-content>
      <v-stepper-content step="3" class="step-3 elevation-0">
        <v-toolbar flat>
          <v-btn
            color="green white--text"
            @click="install"
            :disabled="selectedCount <= 0"
          >
            <v-icon @click="install">mdi-file-import</v-icon>
            Install {{ selectedCount }}
          </v-btn>
          <v-btn
            icon
            small
            :disabled="
              selectedCount === (importPackages ? importPackages.length : 0)
            "
            @click="selectAll"
          >
            <v-icon>mdi-checkbox-multiple-marked-outline</v-icon>
          </v-btn>
          <v-btn icon small :disabled="selectedCount === 0" @click="selectNone">
            <v-icon>mdi-checkbox-multiple-blank-outline</v-icon>
          </v-btn>
        </v-toolbar>
        <v-container>
          <PackageList
            ref="packageList"
            v-if="importInfos"
            :packages="importPackages.map((ip) => ip[1])"
            selectable
            :initial-selected="true"
            @selection-changed="handleSelectionChanged"
          />
        </v-container>
      </v-stepper-content>
      <v-stepper-content step="4" class="elevation-0">
        <h1>Installing Packages...</h1>
        <v-progress-linear indeterminate />
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>
<script lang="ts">
import { clearPackageInfo } from '@/data/packageInfo';
import ipcRenderer, {
  selectImportFiles,
  parseImportFile,
  importPackages
} from '@/ipcRenderer';
import Vue from 'vue';
import PackageList from '@/components/packageList.vue';
import { ImportInfo, ImportPackageInfo } from '@/types/packageInfo';
import { errorSnack, successSnack } from '@/components/snack.vue';

export default Vue.extend({
  name: 'Import',
  components: {
    PackageList
  },
  created() {
    console.log('import created');
    ipcRenderer.on('unarchive_progress', (ev: unknown, percent: number) => {
      console.log('unarchive_progress', percent);
      this.unarchiveProgress = percent;
    });
  },
  data() {
    return {
      step: 1,
      archivePaths: undefined as string[] | undefined,
      importInfos: undefined as ImportInfo[] | undefined,
      unarchiveProgress: 0,
      selectedPkgs: [] as boolean[]
    };
  },
  methods: {
    selectArchive() {
      selectImportFiles().then((paths) => {
        if (paths && paths.length > 0) {
          this.archivePaths = paths;
          this.step = 2;
        }
      });
    },
    install() {
      if (this.importInfos) {
        this.step = 4;
        const packages =
          this.importPackages?.filter((p, i) => this.selectedPkgs[i]) || [];
        const numPackages = packages?.length || 0;
        console.log('importing...');
        importPackages(packages).then(
          () => {
            successSnack(numPackages + ' package(s) imported');
            clearPackageInfo();
            this.$router.push('/packages');
          },
          (err) => {
            errorSnack('failed to import packages', err);
          }
        );
      }
    },
    selectAll() {
      (this.$refs.packageList as any).selectAll();
    },
    selectNone() {
      (this.$refs.packageList as any).selectNone();
    },
    handleSelectionChanged(newVal: boolean[]) {
      this.selectedPkgs = newVal;
    }
  },
  computed: {
    importPackages(): ImportPackageInfo[] | undefined {
      if (!this.importInfos) {
        return undefined;
      }
      let result: ImportPackageInfo[] = [];
      this.importInfos.forEach((importInfo) => {
        result = result.concat(importInfo.packages);
      });
      return result;
    },
    selectedCount(): number {
      return this.selectedPkgs.filter((s) => s).length;
    }
  },
  watch: {
    step: function(newVal) {
      if (newVal === 2 && this.archivePaths) {
        Promise.all(
          this.archivePaths.map(
            (path): Promise<ImportInfo> => {
              return parseImportFile(path);
            }
          )
        ).then((importInfos) => {
          this.importInfos = importInfos;
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
  .step-3 > .v-stepper__wrapper {
    display: flex;
    flex-flow: column nowrap;

    .packages {
      position: relative;
    }
  }
}
</style>
