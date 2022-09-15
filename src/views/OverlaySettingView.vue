<template>
  <div>
    透過度
    <input type="range" min="0" max="100" v-on:input="changeTransparent" />
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

export default class OverlaySetting extends Vue {
  changeTransparent(e: any) {
    (window as any).myAppSetting.changeTransparent(e.target.value);
  }
}
</script>
