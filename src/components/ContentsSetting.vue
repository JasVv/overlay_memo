<template>
  <div v-if="ready">
    <section class="grid">
      <nav>
        <ul v-for="content in contents" v-bind:key="content.id">
          {{
            content.title
          }}
        </ul>
      </nav>
      <article>
        <div>
          <select v-on:change="changeContents" id="contents">
            <option
              v-for="content in contents"
              v-bind:key="content.id"
              v-bind:value="content.id"
            >
              {{ content.title }}
            </option>
          </select>
        </div>

        <div>
          <table border="1">
            <tr v-for="timeline in timelines" v-bind:key="timeline.time">
              <td>{{ timeline.time }}</td>
              <td>{{ timeline.action }}</td>
              <td style="white-space: pre-wrap">{{ timeline.memo }}</td>
            </tr>
            <tr>
              <td><input type="text" v-model="newTime" /></td>
              <td><input type="text" v-model="newAction" /></td>
              <td><textarea v-model="newMemo"></textarea></td>
            </tr>
          </table>
          <button v-on:click="addTimeline">Add</button>
        </div>
      </article>
    </section>
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

export default class ContentsSetting extends Vue {
  ready = false;
  contents: Contents[] = [];
  selected: Contents = this.contents[0];
  timelines: Timelines[] = [];
  newTime = "";
  newAction = "";
  newMemo = "";

  public mounted() {
    (window as any).myAppSetting.openJson().then((data: ContentsJson) => {
      this.contents = data.contents;
      this.selected = data.contents[0];
      this.timelines = data.contents[0].timeline;
      this.ready = true;
    });
  }

  changeTransparent(e: any) {
    (window as any).myAppSetting.changeTransparent(e.target.value);
  }

  changeContents(e: any) {
    const foundContents = this.contents.find(
      (element: Contents) => element.id == e.target.value
    );
    if (foundContents) {
      this.selected = foundContents;
    }
    this.timelines = this.selected.timeline;

    (window as any).myAppSetting.changeContents(e.target.value);
  }

  addTimeline() {
    if (this.newTime != "") {
      const newTimeline = {
        time: this.newTime,
        action: this.newAction,
        memo: this.newMemo,
      };
      this.timelines.push(newTimeline);

      this.newTime = "";
      this.newAction = "";
      this.newMemo = "";

      const selectedIndex = this.contents.findIndex(
        (e) => e.id == this.selected.id
      );
      this.contents[selectedIndex].timeline = this.timelines;
      const newContents: ContentsJson = {
        contents: this.contents,
      };

      (window as any).myAppSetting
        .saveJson(JSON.stringify(newContents, null, 4))
        .then(() => {
          (window as any).myAppSetting.changeContents(this.selected.id);
        });
    }
  }
}
</script>

<style lang="scss">
.grid {
  display: grid;
  grid-template-columns: 150px 1fr;
  * {
    padding: 18px;
  }
  nav {
    grid-column: 1 / 2;
    background-color: aqua;
  }
  article {
    background-color: write;
  }
}
</style>
