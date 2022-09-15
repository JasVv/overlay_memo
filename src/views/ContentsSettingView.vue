<template>
  <div class="home">
    <ContentsSetting />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import ContentsSetting from "@/components/ContentsSetting.vue";

@Options({
  components: {
    ContentsSetting,
  },
})
export default class ContentsSettingView extends Vue {}
</script>
