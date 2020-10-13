<template>
  <v-btn
    icon
    color="primary"
    :title="buttonTooltip"
    v-if="updater"
    @click.stop="checkForUpdates"
  >
    <v-icon>{{ updateIcon }}</v-icon>
    <v-dialog v-model="dialog" width="500">
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
        <v-card-title class="headline grey lighten-2"
          >Installing Update</v-card-title
        >
        <v-card-text v-if="progress"
          >{{ progress.operation }} &hellip;</v-card-text
        >
        <v-progress-linear v-model="progressPercent" />
      </v-card>
    </v-dialog>
  </v-btn>
</template>
<script lang="ts">
import { checkForPackageUpdates, updatePackage } from '@/ipcRenderer';
import { PackageInfo } from '@/types/packageInfo';
import { AvailableUpdate, UpdateProgress, UpdaterDef } from '@/types/updater';
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
      isChecking: false,
      isUpToDate: false,
      progress: undefined as UpdateProgress | undefined
    };
  },
  methods: {
    checkForUpdates() {
      this.isChecking = true;
      this.dialog = false;
      checkForPackageUpdates(this.pkg)
        .then(
          (au) => {
            this.availableUpdate = au;
            this.isUpToDate = !au;
            this.dialog = !!au;
          },
          (err) => {
            errorSnack('Encountered a problem checking for updates', err);
          }
        )
        .finally(() => (this.isChecking = false));
    },
    installUpdate() {
      if (!this.availableUpdate) {
        errorSnack('No update is available');
        return;
      }
      this.updating = true;

      updatePackage(
        this.pkg,
        this.updater,
        this.availableUpdate,
        this.handleProgress
      ).then(
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
    },
    handleProgress(ev: unknown, progress: UpdateProgress) {
      this.progress = progress;
    }
  },
  computed: {
    updateIcon(): string {
      if (this.isUpToDate) {
        return 'mdi-clock-check';
      } else if (this.availableUpdate) {
        return 'mdi-clock-alert';
      } else if (this.isChecking) {
        return 'mdi-update';
      }
      return 'mdi-clock';
    },
    buttonTooltip(): string {
      if (this.isUpToDate) {
        return 'Package is up to date';
      } else if (this.availableUpdate) {
        return 'Update is available';
      } else if (this.isChecking) {
        return 'Checking for updates...';
      }
      return 'Check for updates';
    },
    progressPercent(): number {
      return this.progress?.progress || 0;
    }
  }
});
</script>
