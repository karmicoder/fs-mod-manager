<template>
  <div class="packages">
    <v-tabs @change="tabChanged">
      <v-tab>Installed</v-tab>
      <v-tab>Official</v-tab>
      <v-tab>Inactive</v-tab>
    </v-tabs>
    <PackageList v-if="packages" :packages="packages" />
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import PackageList from '@/components/packageList.vue';
import { getPackages, PackageInfo, PackageLocation } from '@/data/packageInfo';

const tabValues: PackageLocation[] = ['community', 'official', 'inactive'];
// ipcRenderer.
export default Vue.extend({
  components: {
    PackageList
  },
  data() {
    return {
      packages: [] as PackageInfo[],
      location:
        (this.$route.params.tab as PackageLocation) ||
        ('community' as PackageLocation)
    };
  },
  methods: {
    tabChanged(tabIndex: number) {
      this.location = tabValues[tabIndex];
    }
  },
  watch: {
    location(val: PackageLocation) {
      getPackages(val).then(
        (packages) => (this.packages = packages),
        (err) => (this.packages = [])
      );
    }
  },
  created() {
    getPackages(this.location).then((packages) => (this.packages = packages));
  }
});
</script>
