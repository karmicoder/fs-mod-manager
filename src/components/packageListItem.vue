<template>
  <li class="md-card md-ripple">
    <div class="md-card-title">
      <div class="md-title">{{ pkg.title || pkg.directoryName }}</div>
      <div class="md-subhead">v{{ pkg.version }}</div>
    </div>

    <div class="unmet md-card-content" v-if="unmetDeps.length > 0">
      <div v-for="unmetDep in unmetDeps" :key="unmetDep.name">
        {{ unmetDep.name }} : expected {{ unmetDep.expected }}, got
        {{ unmetDep.loaded || 'missing' }}
      </div>
    </div>
  </li>
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
