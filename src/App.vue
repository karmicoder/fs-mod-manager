<template>
  <v-app>
    <v-navigation-drawer
      mini-variant
      mini-variant-width="64"
      permanent
      v-if="showNav"
    >
      <v-list nav class="py-0">
        <v-list-item link to="/packages" :exact="false" title="Packages"
          ><v-icon x-large>mdi-package-variant-closed</v-icon></v-list-item
        >

        <v-list-item link to="/import" title="Import Package"
          ><v-icon x-large>mdi-import</v-icon></v-list-item
        >
        <v-spacer />
        <v-list-item link to="/setup" title="Setup">
          <v-icon x-large>mdi-cog-outline</v-icon>
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

  .v-navigation-drawer {
    padding: 12px 0;
    .v-list {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-flow: column nowrap;
      flex-grow: 1;
      .v-list-item {
        flex: 0 0;
      }
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
import ipcRenderer from './ipcRenderer';
export default Vue.extend({
  name: 'App',
  components: { Snack },
  created() {
    document.addEventListener('keyup', (ev) => {
      if (ev.key === 'F12') {
        console.log('toggle devtools');
        ipcRenderer.send('devtools');
      }
    });
  },
  computed: {
    showNav(): boolean {
      return !this.$route.meta || this.$route.meta.showNav !== false;
    }
  }
});
</script>
