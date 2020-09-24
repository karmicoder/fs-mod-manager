<template>
  <div class="packages">
    <PackageListItem
      v-for="pkg in packages"
      :key="pkg.directoryName"
      :pkg="pkg"
    />
  </div>
</template>
<script lang="ts">
import { PackageInfo } from '@/data/packageInfo';
import Vue from 'vue';
import PackageListItem from './packageListItem.vue';
export default Vue.extend({
  components: { PackageListItem },
  name: 'PackageList',
  props: {
    packages: {
      type: Array as () => PackageInfo[]
    }
  }
});
</script>
<style>
.packages > .v-card {
  max-width: 80%;
  margin: 6px 10%;
}
</style>
