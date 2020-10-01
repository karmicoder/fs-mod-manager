import VueRouter from 'vue-router';

declare module 'vue/types/vue' {
  interface VueConstructor {
    $router: VueRouter;
  }
}
import Vue from 'vue';

declare module 'vue/types/vue' {
  namespace Vue {
    const material: {
      registerTheme(
        name: string | { [key: string]: ThemeType },
        spec?: ThemeType
      ): void;
      setCurrentTheme(name: string): void;
    };
  }
}

declare module global {
  export interface WindowEventMap {
    snack: SnackEvent;
  }
}
