<template>
  <div class="packages" v-if="!loading">
    <v-tabs @change="tabChanged">
      <v-tab
        >Installed
        <v-badge
          inline
          v-if="packages.community"
          :content="packages.community.length"
        />
      </v-tab>

      <v-tab
        >Official
        <v-badge
          inline
          color="green"
          v-if="packages.official"
          :content="packages.official.length"
      /></v-tab>
      <v-tab
        >Inactive
        <v-badge
          color="grey"
          inline
          v-if="packages.inactive"
          :content="packages.inactive.length.toLocaleString()"
      /></v-tab>
    </v-tabs>
    <v-main class="overflow-y-auto">
      <PackageList v-if="packages" :packages="packages[location]" />
    </v-main>
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
      packages: {} as { [key: string]: PackageInfo[] },
      location:
        (this.$route.params.tab as PackageLocation) ||
        ('community' as PackageLocation),
      loading: true
    };
  },
  methods: {
    tabChanged(tabIndex: number) {
      this.location = tabValues[tabIndex];
    },
    getPackages(refresh = false) {
      Promise.all(
        tabValues.map((loc) => {
          return getPackages(loc, refresh).then(
            (pkgs) => Vue.set(this.packages, loc, pkgs),
            () => Vue.set(this.packages, loc, [])
          );
        })
      ).finally(() => (this.loading = false));
    }
  },
  watch: {},
  created() {
    this.getPackages();
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
