<template>
  <v-virtual-scroll :items="packages" item-height="158" class="packages">
    <template v-slot="{ item, index }">
      <PackageListItem
        :key="item.directoryName"
        :pkg="item"
        @deactivated="deactivated"
        @activated="activated"
        @select="itemSelected"
        :selectable="selectable"
        :is-selected="selections[index]"
        :updater="updaters ? updaters[item.directoryName] : undefined"
      />
    </template>
  </v-virtual-scroll>
</template>
<script lang="ts">
import { getUpdaters } from '@/ipcRenderer';
import { PackageInfo } from '@/types/packageInfo';
import { UpdaterMap } from '@/types/updater';
import Vue from 'vue';
import PackageListItem from './packageListItem.vue';
export default Vue.extend({
  components: { PackageListItem },
  name: 'PackageList',
  data() {
    return {
      updaters: {} as UpdaterMap,
      selections: [] as boolean[]
    };
  },
  created() {
    getUpdaters().then((updateMap) => {
      console.log('getUpdaters result', updateMap);
      this.updaters = updateMap || {};
    });
    this.selections = Array(this.packages.length).fill(this.initialSelected);
    this.$emit('selection-changed', this.selections.slice());

    console.log('packageList selected', this.selections);
  },
  props: {
    packages: {
      type: Array as () => PackageInfo[]
    },
    selectable: {
      type: Boolean,
      default: false
    },
    initialSelected: { type: Boolean, default: false }
  },
  methods: {
    deactivated(pkg: PackageInfo) {
      this.$emit('deactivated', pkg);
    },
    activated(pkg: PackageInfo) {
      this.$emit('activated', pkg);
    },
    itemSelected(val: boolean, pkg: PackageInfo): void {
      const index = this.packages.findIndex(
        (p) => p?.directoryName === pkg.directoryName
      );
      if (index >= 0) {
        Vue.set(this.selections, index, val);
        this.$emit('selection-changed', this.selections.slice());
        console.log('itemSelected', this.selections);
      }
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
