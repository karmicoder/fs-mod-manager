<template>
  <div class="splash">
    <div class="splash-content">
      <h1>Welcome to fs-mod-manager</h1>
    </div>
    <div class="splash-bg" />
  </div>
</template>
<script lang="ts">
import { errorSnack } from '@/components/snack.vue';
import { verifySetup } from '@/ipcRenderer';
import Vue from 'vue';
export default Vue.extend({
  name: 'Splash',
  created() {
    setTimeout(
      () =>
        verifySetup().then(
          (valid) => {
            if (valid) {
              this.$router.push('/packages');
            } else {
              console.log('setup not valid, redirecting to setup');
              this.$router.push('/setup');
            }
          },
          (err) => {
            errorSnack('Unable to verify setup', err);
            this.$router.push('/setup');
          }
        ),
      3000
    );
  }
});
</script>
<style lang="scss">
@import '@/styles/default';
.splash {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  .splash-content {
    z-index: 1;
  }
  .splash-bg {
    background: url(../assets/sky-bg.svg) no-repeat center center,
      linear-gradient(#85d3bb 0%, #85d3bb 50%, #000 51%, #000 100%) no-repeat
        center center;
    background-size: 100% 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    pointer-events: none;
    opacity: 0.5;
    z-index: 0;
  }
}
</style>
