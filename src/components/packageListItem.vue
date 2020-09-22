<template>
  <v-card outlined>
    <v-card-title>{{ pkg.title || pkg.directoryName }}</v-card-title>
    <v-card-subtitle
      >{{ pkg.version }}
      {{
        pkg.title && pkg.directoryName !== pkg.title ? pkg.directoryName : ''
      }}
      {{ pkg.contentType }}</v-card-subtitle
    >
    <v-btn v-if="pkg.location === 'community'" @click="backup">
      <v-icon>mdi-folder-upload</v-icon>
    </v-btn>
    <div v-for="unmetDep in unmetDeps" :key="unmetDep.name">
      <span v-if="!unmetDep.loaded">missing {{ unmetDep.name }}</span>
      <span v-else>
        {{ unmetDep.name }} : expected {{ unmetDep.expected }}, got
        {{ unmetDep.loaded }}</span
      >
    </div>
    <div v-if="!isNaN(pkg.size)">
      {{ bytes(pkg.size, { decimalPlaces: 0 }) }}
    </div>
  </v-card>
</template>
<script lang="ts">
import {
  PackageInfo,
  unmetDependencies,
  UnmetPackageDependency
} from '@/data/packageInfo';
import { backupPackage } from '@/ipc';
import bytes from 'bytes';

import Vue from 'vue';

export default Vue.extend({
  name: 'PackageListItem',
  props: {
    pkg: {
      type: Object as () => PackageInfo,
      required: true
    }
  },
  methods: {
    backup() {
      backupPackage(this.pkg).then(
        () => console.log('backed it up!'),
        (err) => console.error('fucked up the backup', err)
      );
    },
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
