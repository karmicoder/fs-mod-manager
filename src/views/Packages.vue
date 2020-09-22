<template>
  <div class="packages">
    <v-tabs @change="tabChanged">
      <v-tab>Installed</v-tab>
      <v-tab>Official</v-tab>
      <v-tab>Inactive</v-tab>
    </v-tabs>
    <v-content class="overflow-y-auto">
      <PackageList v-if="packages" :packages="packages" />
    </v-content>
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
<style lang="scss">
.packages {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  > .v-tabs {
    flex-grow: 0;
  }
  > main {
    flex: 1 1 auto;
  }
}
</style>
