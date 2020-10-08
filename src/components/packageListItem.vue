<template>
  <v-card outlined class="package-list-item">
    <v-checkbox
      class="select"
      v-if="selectable"
      :value="isSelected"
      @change="selected"
    />
    <v-container>
      <v-card-title
        >{{ pkg.title || pkg.directoryName }}{{ ' ' }}
        <v-tooltip bottom v-if="unmetDeps.length > 0">
          <template v-slot:activator="{ on, attrs }"
            ><v-icon size="medium" v-bind="attrs" v-on="on" color="warning"
              >mdi-alert-circle</v-icon
            >
          </template>
          <div v-for="unmetDep in unmetDeps" :key="unmetDep.name">
            <span v-if="!unmetDep.loaded">missing {{ unmetDep.name }}</span>
            <span v-else>
              {{ unmetDep.name }} : expected {{ unmetDep.expected }}, got
              {{ unmetDep.loaded }}</span
            >
          </div>
        </v-tooltip>
      </v-card-title>
      <v-card-subtitle
        >{{ pkg.version }}
        {{
          pkg.title && pkg.directoryName !== pkg.title ? pkg.directoryName : ''
        }}
        <span v-if="!isNaN(pkg.size)">{{
          bytes(pkg.size, { decimalPlaces: 0 })
        }}</span>
        {{ pkg.contentType }}
      </v-card-subtitle>

      <v-card-actions>
        <v-spacer />
        <BackupDialog :pkg="pkg"></BackupDialog>
        <v-btn
          v-if="pkg.location === 'community'"
          color="alternate"
          icon
          title="Deactivate"
          @click="deactivate"
          ><v-icon>mdi-clipboard-arrow-right</v-icon>
        </v-btn>
        <v-btn
          v-if="pkg.location === 'inactive'"
          color="primary"
          icon
          title="Activate"
          @click="activate"
        >
          <v-icon>mdi-clipboard-arrow-left</v-icon>
        </v-btn>
        <v-btn
          v-if="updater"
          icon
          title="Check for Updates"
          @click="checkForUpdates"
        >
          <v-icon>mdi-clipboard-arrow-up</v-icon>
        </v-btn>
      </v-card-actions>
    </v-container>
  </v-card>
</template>
<script lang="ts">
import { unmetDependencies } from '@/data/packageInfo';
import bytes from 'bytes';
import BackupDialog from '@/components/backupDialog.vue';
import Vue from 'vue';
import { PackageInfo, UnmetPackageDependency } from '@/types/packageInfo';
import {
  activatePackage,
  deactivatePackage,
  checkForPackageUpdates
} from '@/ipc';
import { errorSnack, successSnack } from './snack.vue';
import { UpdaterDef } from '@/types/updater';

export default Vue.extend({
  name: 'PackageListItem',
  components: {
    BackupDialog
  },
  props: {
    pkg: {
      type: Object as () => PackageInfo,
      required: true
    },
    selectable: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: true
    },
    updater: {
      type: Object as () => UpdaterDef
    }
  },
  methods: {
    bytes,
    deactivate() {
      deactivatePackage(this.pkg).then(
        () => {
          successSnack(
            (this.pkg.title || this.pkg.directoryName) + ' deactivated'
          );
          this.$emit('deactivated', this.pkg);
        },
        (err) => {
          errorSnack('Failed to deactivate package', err);
        }
      );
    },
    activate() {
      activatePackage(this.pkg).then(
        () => {
          successSnack(
            (this.pkg.title || this.pkg.directoryName) + ' activated'
          );
          this.$emit('activated', this.pkg);
        },
        (err) => {
          errorSnack('Failed to activate package', err);
        }
      );
    },
    selected(val: boolean) {
      this.$emit('selected', val);
    },
    checkForUpdates() {
      checkForPackageUpdates(this.pkg).then(
        (au) => {
          console.log('Available update', au);
        },
        (err) => {
          errorSnack('Encountered a problem checking for updates', err);
        }
      );
    }
  },
  computed: {
    unmetDeps(): UnmetPackageDependency[] {
      return unmetDependencies(this.pkg);
    }
  }
});
</script>
<style lang="scss">
.package-list-item {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  > .select {
    margin: 0;
    padding: 0 12px;
    width: 48px;
  }
  > .container {
    padding: 0;
  }
}
</style>
