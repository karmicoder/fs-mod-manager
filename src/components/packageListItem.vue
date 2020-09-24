<template>
  <v-card outlined>
    <v-card-title
      >{{ pkg.title || pkg.directoryName }}{{ ' ' }}
      <v-icon v-if="unmetDeps.length > 0" style="float: right" color="warning"
        >mdi-alert-circle</v-icon
      >
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

    <div v-for="unmetDep in unmetDeps" :key="unmetDep.name">
      <span v-if="!unmetDep.loaded">missing {{ unmetDep.name }}</span>
      <span v-else>
        {{ unmetDep.name }} : expected {{ unmetDep.expected }}, got
        {{ unmetDep.loaded }}</span
      >
    </div>
    <v-card-actions>
      <BackupDialog :pkg="pkg"></BackupDialog>
      <v-btn
        v-if="pkg.location === 'community'"
        color="alternate"
        icon
        title="Deactivate"
        ><v-icon>mdi-archive</v-icon></v-btn
      >
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import {
  PackageInfo,
  unmetDependencies,
  UnmetPackageDependency
} from '@/data/packageInfo';
import bytes from 'bytes';
import BackupDialog from '@/components/backupDialog.vue';
import Vue from 'vue';

export default Vue.extend({
  name: 'PackageListItem',
  components: {
    BackupDialog
  },
  props: {
    pkg: {
      type: Object as () => PackageInfo,
      required: true
    }
  },
  methods: {
    bytes
  },
  computed: {
    unmetDeps(): UnmetPackageDependency[] {
      return unmetDependencies(this.pkg);
    }
  }
});
</script>
<style scoped></style>
