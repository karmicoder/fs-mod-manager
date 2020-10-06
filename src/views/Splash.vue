<template>
  <h1>Welcome to fs-mod-manager</h1>
</template>
<script lang="ts">
import { errorSnack } from '@/components/snack.vue';
import { verifySetup } from '@/ipc';
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
