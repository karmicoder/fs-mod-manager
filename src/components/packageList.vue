<template>
  <p v-if="packages && packages.length > 300">
    {{ packages.length }} installed packages
  </p>
  <ul v-else class="packages">
    <PackageListItem v-for="pkg in packages" :key="pkg.title" :pkg="pkg" />
  </ul>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import PackageListItem from './packageListItem.vue';
export default defineComponent({
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
