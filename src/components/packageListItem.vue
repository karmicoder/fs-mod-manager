<template>
  <v-card outlined>
    <v-card-title>{{ pkg.title || pkg.directoryName }}</v-card-title>
    <v-card-subtitle>{{ pkg.version }}</v-card-subtitle>

    <div v-for="unmetDep in unmetDeps" :key="unmetDep.name">
      {{ unmetDep.name }} : expected {{ unmetDep.expected }}, got
      {{ unmetDep.loaded || 'missing' }}
    </div>
  </v-card>
</template>
<script lang="ts">
import {
  PackageInfo,
  unmetDependencies,
  UnmetPackageDependency
} from '@/data/packageInfo';

import Vue from 'vue';

export default Vue.extend({
  name: 'PackageListItem',
  props: {
    pkg: {
      type: Object as () => PackageInfo,
      required: true
    }
  },
  computed: {
    unmetDeps(): UnmetPackageDependency[] {
      return unmetDependencies(this.pkg);
    }
  }
});
</script>
<style scoped></style>
