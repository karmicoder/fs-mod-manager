<template>
  <v-app>
    <v-navigation-drawer
      mini-variant
      mini-variant-width="64"
      permanent
      v-if="showNav"
    >
      <v-list dense nav class="py-0">
        <v-list-item link to="/packages" :exact="false"
          ><v-icon x-large>mdi-package-variant-closed</v-icon></v-list-item
        >
      </v-list>
      <v-list dense nav class="py-0">
        <v-list-item link to="/import"
          ><v-icon x-large>mdi-file-import</v-icon></v-list-item
        >
      </v-list>
      <v-list dense nav class="py-0">
        <v-list-item link to="/setup">
          <v-icon x-large>mdi-wrench</v-icon>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
      <Snack />
    </v-main>
  </v-app>
</template>
<style lang="scss">
.v-application {
  .v-application--wrap {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    flex-direction: row;
    .v-main {
      flex-grow: 1;
      overflow-y: auto;
    }
  }

  // .sidebar {
  //   position: fixed;
  //   top: 0;
  //   bottom: 0;
  //   width: 42px;
  // }
}
</style>
<script lang="ts">
import Vue from 'vue';
import Snack from '@/components/snack.vue';
export default Vue.extend({
  name: 'App',
  components: { Snack },
  computed: {
    showNav(): boolean {
      return !this.$route.meta || this.$route.meta.showNav !== false;
    }
  }
});
</script>
