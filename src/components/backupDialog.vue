<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        dark
        color="primary"
        icon
        v-if="pkg.location === 'community'"
        title="Backup"
        v-on="on"
        v-bind="attrs"
      >
        <v-icon>mdi-folder-upload</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="headline grey lighten-2">
        Backup {{ pkg.title || pkg.directoryName }}
      </v-card-title>
      <v-card-text v-if="!saving">
        This backup may take up to {{ bytes(pkg.size) }} of disk space.
      </v-card-text>
      <v-card-text v-else>
        <v-progress-linear indeterminate />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="secondary" text @click="close" :disabled="saving"
          >Cancel</v-btn
        >
        <v-btn color="primary" text @click="doBackup" :disabled="saving"
          >Backup</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { backupPackage } from '@/ipcRenderer';
import { PackageInfo } from '@/types/packageInfo';
import bytes from 'bytes';
import Vue from 'vue';
import { errorSnack, successSnack } from './snack.vue';
export default Vue.extend({
  name: 'BackupDialog',
  props: {
    pkg: { type: Object as () => PackageInfo, required: true }
  },
  data() {
    return {
      dialog: false,
      saving: false,
      saved: false
    };
  },
  methods: {
    bytes,
    doBackup() {
      this.saving = true;
      backupPackage(this.pkg)
        .then(
          () => {
            this.saved = true;
            this.dialog = false;
            successSnack(
              (this.pkg.title || this.pkg.directoryName) + ' Backed Up'
            );
          },
          (err) =>
            errorSnack(
              'Unable to back up ' + (this.pkg.title || this.pkg.directoryName),
              err
            )
        )
        .finally(() => (this.saving = false));
    },
    close() {
      this.dialog = false;
    }
  }
});
</script>
