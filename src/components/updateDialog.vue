<template>
  <v-dialog v-model="dialog" width="500" v-if="updater">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        icon
        color="primary"
        title="Check for Updates"
        v-on="on"
        v-bind="attrs"
        @click="checkForUpdates"
      >
        <v-icon>{{ updateIcon }}</v-icon>
      </v-btn>
    </template>
    <v-card v-if="!updating">
      <v-card-title class="headline grey lighten-2"
        >Update Available</v-card-title
      >
      <v-card-text v-if="pkg && availableUpdate"
        >{{ pkg.title || pkg.directoryName }} {{ pkg.version }} ➔
        {{ availableUpdate.version }}
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="installUpdate">
          Install Update
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-if="updating">
      <v-card-text>Installing Update &hellip;</v-card-text>
      <v-progress-linear indeterminate />
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { checkForPackageUpdates, updatePackage } from '@/ipcRenderer';
import { PackageInfo } from '@/types/packageInfo';
import { AvailableUpdate, UpdaterDef } from '@/types/updater';
import Vue from 'vue';
import { errorSnack, successSnack } from './snack.vue';

export default Vue.extend({
  name: 'UpdateDialog',
  props: {
    pkg: {
      type: Object as () => PackageInfo,
      required: true
    },
    updater: {
      type: Object as () => UpdaterDef
    }
  },
  data() {
    return {
      dialog: false,
      availableUpdate: undefined as AvailableUpdate | undefined,
      updating: false,
      isUpToDate: false
    };
  },
  methods: {
    checkForUpdates() {
      checkForPackageUpdates(this.pkg).then(
        (au) => {
          this.availableUpdate = au;
          this.isUpToDate = !au;
        },
        (err) => {
          errorSnack('Encountered a problem checking for updates', err);
        }
      );
    },
    installUpdate() {
      this.updating = true;
      updatePackage(this.pkg, this.updater).then(
        (result) => {
          this.dialog = false;
          this.updating = false;
          successSnack(
            (result.pkg.title || result.pkg.directoryName) +
              ' updated to version ' +
              result.updater.lastVersion
          );
          this.$emit('updated', result);
        },
        (err) => {
          this.updating = false;
          this.dialog = false;
          errorSnack(
            'Unable to update ' + (this.pkg.title || this.pkg.directoryName),
            err
          );
        }
      );
    }
  },
  computed: {
    updateIcon(): string {
      if (this.isUpToDate) {
        return 'mdi-clock-check';
      } else if (this.availableUpdate) {
        return 'mdi-clock-alert';
      }
      return 'mdi-clock';
    }
  }
});
</script>
