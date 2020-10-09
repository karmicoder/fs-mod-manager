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
    <v-card>
      <v-card-title class="headline grey lighten-2"
        >Update Available</v-card-title
      >
      <v-card-text v-if="pkg && availableUpdate"
        >{{ pkg.title || pkg.directoryName }} {{ pkg.version }} ➔
        {{ availableUpdate.version }}
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { checkForPackageUpdates } from '@/ipc';
import { PackageInfo } from '@/types/packageInfo';
import { AvailableUpdate, UpdaterDef } from '@/types/updater';
import Vue from 'vue';
import { errorSnack } from './snack.vue';

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
