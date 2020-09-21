<template>
  <p v-if="packages && packages.length > 300">
    {{ packages.length }} installed packages
  </p>
  <ul v-else class="packages">
    <PackageListItem
      v-for="pkg in packages"
      :key="pkg.directoryName"
      :pkg="pkg"
    />
  </ul>
</template>
<script lang="ts">
import Vue from 'vue';
import PackageListItem from './packageListItem.vue';
export default Vue.extend({
  components: { PackageListItem },
  name: 'PackageList',
  props: {
    packages: {
      type: Array,
      required: true
    }
  }
});
</script>
