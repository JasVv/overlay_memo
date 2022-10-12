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
      <div class="timeline__body">
        <!-- Left vertical line -->
        <div class="timeline__line"></div>

        <!-- The timeline items timeline -->
        <div class="timeline__items">
          <!-- Each timeline item -->
          <div class="timeline__item timelineHead">
            <!-- The circle and title -->
            <div class="timeline__top">
              <!-- The circle -->
              <div class="timeline__circle"></div>

              <!-- The title -->
              <div class="timeline__title">
                {{ timelineHead.time }} {{ timelineHead.action }}
              </div>
            </div>

            <!-- The description -->
            <div class="timeline__desc" style="white-space: pre-wrap">
              {{ timelineHead.memo }}
            </div>
          </div>

          <div class="timeline__item timelineNext">
            <!-- The circle and title -->
            <div class="timeline__top">
              <!-- The circle -->
              <div class="timeline__circle__next"></div>

              <!-- The title -->
              <div class="timeline__title">
                {{ timelineNext.time }} {{ timelineNext.action }}
              </div>
            </div>

            <!-- The description -->
            <div class="timeline__desc" style="white-space: pre-wrap">
              {{ timelineNext.memo }}
            </div>
          </div>

          <!-- Repeat other items -->
          <div
            class="timeline__item"
            v-for="timeline in timelines"
            v-bind:key="timeline.id"
          >
            <!-- The circle and title -->
            <div class="timeline__top">
              <!-- The circle -->
              <div class="timeline__circle"></div>

              <!-- The title -->
              <div class="timeline__title">
                {{ timeline.time }} {{ timeline.action }}
              </div>
            </div>

            <!-- The description -->
            <div class="timeline__desc" style="white-space: pre-wrap">
              {{ timeline.memo }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

interface Timelines {
  id: number;
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
  transparent = 0.7;

  public mounted() {
    const target: HTMLElement | null = document.getElementById("main");
    if (target) {
      target.style.backgroundColor = `rgba(24, 24, 24, ${this.transparent})`;
    }

    (window as any).myApp.updateTransparent((event: any, value: number) => {
      const transparentValue = (100 - value) / 100;
      const target: HTMLElement | null = document.getElementById("main");
      if (target) {
        target.style.backgroundColor = `rgba(24, 24, 24, ${transparentValue})`;
      }
    });

    (window as any).myApp.updateContents((event: any, id: number) => {
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
    });

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
}
</script>

<style lang="scss">
.timeline {
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
  background-color: rgba(24, 24, 24, 0);
  -webkit-app-region: no-drag;
}

.timelineHead {
  color: #808080;
}

.timelineNext {
  border-radius: 5px;
  border-style: solid;
  border-color: yellow;
  border-width: 1px;
}

.timeline__body {
  /* Used to position the left vertical line */
  position: relative;
}

.timeline__line {
  /* Border */
  border-right: 2px solid #d1d5db;

  /* Positioned at the left */
  left: 0.95rem;
  position: absolute;
  top: 20px;

  /* Take full height */
  height: 9999px;
}

.timeline__items {
  /* Reset styles */
  list-style-type: none;
  margin: 0px;
  padding: 0px;
}

.timeline__item {
  margin-bottom: 20px;
}

.timeline__top {
  /* Center the content horizontally */
  align-items: center;
  display: flex;
}

.timeline__circle {
  /* Rounded border */
  background-color: #d1d5db;
  border-radius: 9999px;

  /* Size */
  height: 1rem;
  width: 1rem;

  margin-left: 0.5rem;
}

.timeline__circle__next {
  /* Rounded border */
  background-color: #d1d5db;
  border-radius: 9999px;

  /* Size */
  height: 1rem;
  width: 1rem;

  margin-left: 0.45rem;
}

.timeline__title {
  /* Take available width */
  flex: 1;
  margin-left: 0.5rem;
}

.timeline__desc {
  /* Make it align with the title */
  margin-left: 3rem;
  font-size: 14px;
}
</style>
