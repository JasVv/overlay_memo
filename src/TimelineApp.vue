<template>
  <div class="timelineApp">
    <Timeline />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Timeline from "@/components/Timeline.vue";

@Options({
  components: {
    Timeline,
  },
})
export default class TimelineApp extends Vue {}
</script>
