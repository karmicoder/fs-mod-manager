<template>
  <v-app>
    <v-navigation-drawer mini-variant permanent>
      <v-list dense nav class="py-0">
        <v-list-item link to="/packages" exact="false"
          ><v-icon>mdi-package-variant-closed</v-icon></v-list-item
        >
      </v-list>
      <v-list dense nav class="py-0">
        <v-list-item link to="/setup">
          <v-icon>mdi-backup-restore</v-icon>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
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
