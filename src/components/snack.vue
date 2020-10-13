<template>
  <v-snackbar
    v-if="!!currentSnack"
    value="!!currentSnack"
    :color="currentSnack.color"
    :timeout="currentSnack.timeout"
    top
  >
    {{ currentSnack.text }}
    <template v-slot:action="{ attrs }" v-if="currentSnack.closeable">
      <v-btn color="accent--text" text v-bind="attrs" @click="closeSnack"
        >Close</v-btn
      >
    </template>
  </v-snackbar>
</template>
<script lang="ts">
import Vue from 'vue';

export interface SnackRequest {
  color?: string;
  text: string;
  details?: string;
  closeable: boolean;
  timeout: number;
}

export interface SnackEvent extends Event {
  snack: SnackRequest;
}
export class SnackEvent extends Event {
  snack: SnackRequest;
  constructor(req: SnackRequest) {
    super('snack');
    this.snack = req;
  }
}

function addSnack(req: SnackRequest) {
  const ev = new SnackEvent(req);
  console.log('raising snack event', ev);
  dispatchEvent(ev);
}

export function successSnack(text: string) {
  addSnack({
    color: 'success',
    text,
    closeable: true,
    timeout: 10000
  });
}

export function errorSnack(text: string, err?: Error) {
  addSnack({
    color: 'error',
    text,
    details: err?.message + '\n' + err?.stack,
    closeable: true,
    timeout: 30000
  });
}

export default Vue.extend({
  name: 'Snack',
  data() {
    return {
      pendingSnacks: [] as SnackRequest[],
      currentSnack: undefined as SnackRequest | undefined
    };
  },
  created() {
    addEventListener('snack', this.addSnack);
  },
  // eslint-disable-next-line vue/no-deprecated-destroyed-lifecycle
  beforeDestroy() {
    removeEventListener('snack', this.addSnack);
  },
  methods: {
    addSnack(ev: Event) {
      if (!(ev as SnackEvent).snack) {
        console.error('ignoring snack event, not of type SnackEvent');
        return;
      }
      console.log('snack: adding pending', ev);
      this.pendingSnacks.push((ev as SnackEvent).snack);
      Vue.set(this, 'pendingSnacks', this.pendingSnacks);
      this.tryToSnack();
    },
    closeSnack() {
      this.currentSnack = undefined;
      this.tryToSnack();
    },
    tryToSnack() {
      if (this.currentSnack === undefined && this.pendingSnacks.length > 0) {
        this.currentSnack = this.pendingSnacks.splice(0, 1)[0];
      }
    }
  }
});
</script>
