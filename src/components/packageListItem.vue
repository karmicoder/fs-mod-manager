<template>
  <v-card outlined class="package-list-item">
    <v-checkbox
      class="select"
      v-if="selectable"
      :true-value="true"
      v-model="internalSelected"
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
        <UpdateDialog :pkg="pkg" :updater="updater" />
        <BackupDialog :pkg="pkg"></BackupDialog>
        <v-btn
          v-if="pkg.location === 'community'"
          color="alternate"
          icon
          title="Deactivate"
          @click="deactivate"
          ><v-icon>mdi-folder-move</v-icon>
        </v-btn>
        <v-btn
          v-if="pkg.location === 'inactive'"
          color="primary"
          icon
          title="Activate"
          @click="activate"
        >
          <v-icon>mdi-folder-plus</v-icon>
        </v-btn>
      </v-card-actions>
    </v-container>
  </v-card>
</template>
<script lang="ts">
import { unmetDependencies } from '@/data/packageInfo';
import bytes from 'bytes';
import BackupDialog from '@/components/backupDialog.vue';
import UpdateDialog from '@/components/updateDialog.vue';
import Vue from 'vue';
import { PackageInfo, UnmetPackageDependency } from '@/types/packageInfo';
import { activatePackage, deactivatePackage } from '@/ipcRenderer';
import { errorSnack, successSnack } from './snack.vue';
import { UpdaterDef } from '@/types/updater';

export default Vue.extend({
  name: 'PackageListItem',
  components: {
    BackupDialog,
    UpdateDialog
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
      default: false
    },
    updater: {
      type: Object as () => UpdaterDef
    }
  },
  data() {
    return {
      internalSelected: this.isSelected
    };
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
        (err: Error) => {
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
        (err: Error) => {
          errorSnack('Failed to activate package', err);
        }
      );
    },
    checkChanged(val: boolean | null) {
      console.log('item selected', { pkg: this.pkg, val });
      this.$emit('select', !!val, this.pkg);
    }
  },
  computed: {
    unmetDeps(): UnmetPackageDependency[] {
      return unmetDependencies(this.pkg);
    }
  },
  watch: {
    internalSelected(newVal) {
      this.$emit('select', !!newVal, this.pkg);
    },
    isSelected(newVal) {
      this.internalSelected = newVal;
    }
  }
});
</script>
<style lang="scss">
.package-list-item {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  margin: 12px auto;
  width: 80%;
  > .select {
    margin: 0;
    padding: 0 6px;
    width: 48px;
  }
  > .container {
    padding: 0;
  }
}
</style>
