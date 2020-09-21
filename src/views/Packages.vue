<template>
  <div class="setup">
    <h1>Packages</h1>
    <h3>Official</h3>
    <PackageList v-if="officialPackages" :packages="officialPackages" />
    <h3>Community</h3>
    <PackageList v-if="packages" :packages="packages" />
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import {
  getCommunityPackages,
  getOfficialPackages,
  PackageInfo
} from '@/data/packageInfo';
import PackageList from '@/components/packageList.vue';

// ipcRenderer.
export default Vue.extend({
  components: {
    PackageList
  },
  data() {
    return {
      packages: [] as PackageInfo[],
      officialPackages: undefined as PackageInfo[] | undefined
    };
  },
  created() {
    getOfficialPackages().then(
      (packages) => (this.officialPackages = packages)
    );
    getCommunityPackages().then((packages) => (this.packages = packages));
  }
});
</script>
