<template>
  <div class="packages">
    <p v-if="packages && packages.length > 300">
      {{ packages.length }} installed packages
    </p>
    <div class="packages">
      <PackageListItem
        v-for="pkg in packages"
        :key="pkg.directoryName"
        :pkg="pkg"
      />
    </div>
  </div>
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
<style>
.packages > .v-card {
  max-width: 80%;
  margin: 6px 10%;
}
</style>
