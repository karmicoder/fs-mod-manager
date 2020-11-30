<template>
  <div class="page-packages" v-if="!loading">
    <v-tabs @change="tabChanged">
      <v-tab
        >Community
        <v-badge
          inline
          v-if="packages.community"
          :content="packages.community.length.toLocaleString()"
        />
      </v-tab>

      <v-tab color="green"
        >Official
        <v-badge
          inline
          color="green"
          v-if="packages.official"
          :content="packages.official.length.toLocaleString()"
      /></v-tab>
      <v-tab
        >Inactive
        <v-badge
          color="grey"
          inline
          v-if="packages.inactive"
          :content="packages.inactive.length.toLocaleString()"
      /></v-tab>
      <v-spacer />
      <v-btn
        color="accent"
        icon
        title="Force Refresh"
        @click="getPackages(true)"
        ><v-icon>mdi-refresh</v-icon></v-btn
      >
    </v-tabs>
    <v-main class="overflow-y-auto">
      <p v-if="location === 'official'">
        Official packges are managed in-game. Currently installed official
        packages are listed here for reference.
      </p>
      <PackageList
        v-if="packages"
        :packages="packages[location]"
        @deactivated="packageDeactivated"
        @activated="packageActivated"
      />
    </v-main>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import PackageList from '@/components/packageList.vue';
import { getPackages, packageNameComparator } from '@/data/packageInfo';
import { PackageInfo, PackageLocation } from '@/types/packageInfo';

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
      if (refresh) {
        this.packages = {};
      }
      this.loading = true;
      Promise.all(
        tabValues.map((loc) => {
          return getPackages(loc, refresh).then(
            (pkgs) => Vue.set(this.packages, loc, pkgs || []),
            (err) => {
              console.error('getPackages failed for ' + loc, err);
              Vue.set(this.packages, loc, []);
            }
          );
        })
      ).finally(() => {
        this.loading = false;
        console.log('packages', this.packages);
      });
    },
    packageDeactivated(pkg: PackageInfo) {
      // remove from community
      Vue.set(
        this.packages,
        'community',
        this.packages.community.filter(
          (p) => p.directoryName !== pkg.directoryName
        )
      );
      // add to inactive
      Vue.set(
        this.packages,
        'inactive',
        this.packages.inactive.concat([pkg]).sort(packageNameComparator)
      );
      // update location
      pkg.location = 'inactive';
    },
    packageActivated(pkg: PackageInfo) {
      // remove from inactive
      Vue.set(
        this.packages,
        'inactive',
        this.packages.inactive.filter(
          (p) => p.directoryName !== pkg.directoryName
        )
      );
      // add to active
      Vue.set(
        this.packages,
        'active',
        this.packages.active.concat([pkg]).sort(packageNameComparator)
      );
      pkg.location = 'community';
    }
  },
  watch: {},
  created() {
    this.getPackages();
  }
});
</script>
<style lang="scss">
.page-packages {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  > .v-tabs {
    flex-grow: 0;
    .v-btn {
      align-self: center;
    }
  }
  > main {
    flex: 1 1 auto;
  }
}
</style>
