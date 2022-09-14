<template>
  <div class="timeline" v-if="ready">
    <div class="grid">
      <header>
        {{ title }} {{ time }}
        <button class="button" v-on:click="startCount">
          <img src="../assets/start.png" alt="button" width="16" height="16" />️
        </button>
        <button class="button" v-on:click="stopCount">
          <img src="../assets/stop.png" alt="button" width="16" height="16" />️
        </button>
      </header>
      <table border="1">
        <tr class="timelineHead">
          <td>{{ timelineHead.time }}</td>
          <td>{{ timelineHead.action }}</td>
          <td style="white-space: pre-wrap">{{ timelineHead.memo }}</td>
        </tr>
        <tr class="timelineNext">
          <td>{{ timelineNext.time }}</td>
          <td>{{ timelineNext.action }}</td>
          <td style="white-space: pre-wrap">{{ timelineNext.memo }}</td>
        </tr>
        <tr v-for="timeline in timelines" v-bind:key="timeline.time">
          <td>{{ timeline.time }}</td>
          <td>{{ timeline.action }}</td>
          <td style="white-space: pre-wrap">{{ timeline.memo }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

interface Timelines {
  time: string;
  action: string;
  memo: string;
}

interface Contents {
  id: number;
  title: string;
  beforeCount: number;
  timeline: Timelines[];
}

interface ContentsJson {
  contents: Contents[];
}

export default class Timeline extends Vue {
  ready = false;
  contents: Contents[] = [];
  selected: Contents = this.contents[0];
  title = "";
  initialTimelines: Timelines[] = [];
  timelineHead: Timelines = this.initialTimelines[0];
  timelineNext: Timelines = this.initialTimelines[1];
  timelines: Timelines[] = this.initialTimelines.slice(2);
  beforeCount = 0;
  count = 0;
  interval: any = null;
  time = "00:00";

  mounted() {
    (window as any).myApp.openJson().then((data: ContentsJson) => {
      this.contents = data.contents;
      this.selected = data.contents[0];
      this.title = data.contents[0].title;
      this.initialTimelines = data.contents[0].timeline;
      this.timelineHead = data.contents[0].timeline[0];
      this.timelineNext = data.contents[0].timeline[1];
      this.timelines = data.contents[0].timeline.slice(2);
      this.beforeCount = data.contents[0].beforeCount;
      this.count = data.contents[0].beforeCount * -1;
      this.ready = true;
    });
  }

  calcTimeFromString(time: string) {
    const t = time.split(":");
    const t1 = Number(t[0]) * 60;
    const t2 = Number(t[1]);
    return t1 + t2;
  }

  calcTimeFromInt(time: number) {
    const m = Math.floor(time / 60);
    const s = time % 60;
    const mStr = m < 10 ? "0" + String(m) : String(m);
    const sStr = s < 10 ? "0" + String(s) : String(s);
    return mStr + ":" + sStr;
  }

  startCount() {
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.count++;
        if (this.count >= 0) {
          this.time = " " + this.calcTimeFromInt(this.count);
        } else {
          this.time = "-" + this.calcTimeFromInt(this.count * -1);
        }

        const isOk = (e: Timelines) =>
          this.calcTimeFromString(e.time) > this.count;
        const newTimelineIndex = this.initialTimelines.findIndex(isOk);

        if (newTimelineIndex != 0 && newTimelineIndex != -1) {
          this.timelineHead = this.initialTimelines[newTimelineIndex - 1];
          this.timelineNext = this.initialTimelines[newTimelineIndex];
          this.timelines = this.initialTimelines.slice(newTimelineIndex + 1);
        }
      }, 1000);
    }
  }

  stopCount() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.time = "00:00";
    }

    this.count = this.beforeCount * -1;
    this.timelineHead = this.initialTimelines[0];
    this.timelineNext = this.initialTimelines[1];
    this.timelines = this.initialTimelines.slice(2);
  }

  changeContents(id: number) {
    if (this.interval) {
      clearInterval(this.interval);
    }

    (window as any).myApp.openJson().then((newData: ContentsJson) => {
      this.contents = newData.contents;
      const foundContents = this.contents.find(
        (element: Contents) => element.id == id
      );
      if (foundContents) {
        this.selected = foundContents;
      }
      this.title = this.selected.title;
      this.initialTimelines = this.selected.timeline;
      this.timelineHead = this.selected.timeline[0];
      this.timelineNext = this.selected.timeline[1];
      this.timelines = this.selected.timeline.slice(2);
      this.beforeCount = this.selected.beforeCount;
      this.count = this.selected.beforeCount * -1;
      this.interval = null;
      this.time = "00:00";
    });
  }
}
</script>

<style lang="scss">
.timeline {
  background-color: rgba(24, 24, 24, 0.5);
  color: #fff;
  -webkit-app-region: no-drag;
  -webkit-user-select: none;
}

header {
  -webkit-app-region: drag;
}

.grid {
  display: grid;
  grid-template-rows: 1fr 20px;
  header {
    grid-row: 1 / 2;
  }
}

.button {
  display: inline-block;
  background-color: rgba(24, 24, 24, 1);
  -webkit-app-region: no-drag;
}

.timelineHead {
  color: #808080;
}

.timelineNext {
  color: #ffff00;
}
</style>
