<template>
  <v-virtual-scroll :items="packages" item-height="158" class="packages">
    <template v-slot="{ item }">
      <PackageListItem
        :key="item.directoryName"
        :pkg="item"
        @deactivated="deactivated"
        @activated="activated"
        :selectable="selectable"
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
      updaters: {} as UpdaterMap
    };
  },
  created() {
    getUpdaters().then((updateMap) => {
      console.log('getUpdaters result', updateMap);
      this.updaters = updateMap || {};
    });
  },
  props: {
    packages: {
      type: Array as () => PackageInfo[]
    },
    selectable: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    deactivated(pkg: PackageInfo) {
      this.$emit('deactivated', pkg);
    },
    activated(pkg: PackageInfo) {
      this.$emit('activated', pkg);
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
