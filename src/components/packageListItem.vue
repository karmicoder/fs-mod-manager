<template>
  <li class="package">
    {{ pkg.title || pkg.directoryName }}
    <span v-if="pkg.version">v{{ pkg.version }}</span>
    <div class="unmet" v-if="unmetDeps.length > 0">
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
import { defineComponent } from 'vue';

export default defineComponent({
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
