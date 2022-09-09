const calcTimeFromString = (time) => {
  const t = time.split(':');
  const t1 = Number(t[0]) * 60
  const t2 = Number(t[1])
  return t1 + t2
}

const calcTimeFromInt = (time) => {
  const m = Math.floor(time / 60)
  const s = time % 60
  const mStr = m < 10 ? "0" + String(m) : String(m)
  const sStr = s < 10 ? "0" + String(s) : String(s)
  return mStr + ":" + sStr
}

let vue = null;

window.myApp.openJson().then((data) => {
  const vueApp = {
    data() {
      return {
        contents: data.contents,
        selected: data.contents[0],
        title: data.contents[0].title,
        initialTimelines: data.contents[0].timeline,
        timelineHead: data.contents[0].timeline[0],
        timelineNext: data.contents[0].timeline[1],
        timelines: data.contents[0].timeline.slice(2),
        beforeCount: data.contents[0].beforeCount,
        count: data.contents[0].beforeCount * -1,
        interval: null,
        time: "00:00",
      }
    },
    mounted() {

    },
    methods: {
      startCount() {
        if (!this.interval) {
          this.interval = setInterval(() => {
            this.count++
            if (this.count >= 0) {
              this.time = " " + calcTimeFromInt(this.count)
            } else {
              this.time = "-" + calcTimeFromInt(this.count * -1)
            }

            const isOk = (e) => calcTimeFromString(e.time) > this.count
            const newTimelineIndex = this.initialTimelines.findIndex(isOk)

            if (newTimelineIndex != 0 && newTimelineIndex != -1) {
              this.timelineHead = this.initialTimelines[newTimelineIndex - 1]
              this.timelineNext = this.initialTimelines[newTimelineIndex]
              this.timelines = this.initialTimelines.slice(newTimelineIndex + 1)
            }
          }, 1000)
        }
      },

      stopCount() {
        if (this.interval) {
          clearInterval(this.interval)
          this.interval = null
          this.time = "00:00"
        }

        this.count = this.beforeCount * -1
        this.timelineHead = this.initialTimelines[0]
        this.timelineNext = this.initialTimelines[1]
        this.timelines = this.initialTimelines.slice(2)
      },

      changeContents(id) {
        if (this.interval) {
          clearInterval(this.interval)
          this.interval = null
          this.time = "00:00"
        }

        this.selected = this.contents.find(element => element.id == id);
        this.title = this.selected.title
        this.initialTimelines = this.selected.timeline
        this.timelineHead = this.selected.timeline[0]
        this.timelineNext = this.selected.timeline[1]
        this.timelines = this.selected.timeline.slice(2)
        this.beforeCount = this.selected.beforeCount
        this.count = this.selected.beforeCount * -1
        this.interval = null
        this.time = "00:00"
      }
    }
  }

  vue = Vue.createApp(vueApp).mount('#app');
});

window.myApp.updateTransparent((event, value) => {
  const transparentValue = (100 - Number(value)) / 100;
  const target = document.getElementById("main");
  target.style.backgroundColor = `rgba(24, 24, 24, ${transparentValue})`;
})

window.myApp.updateContents((event, id) => {
  vue.changeContents(id);
})
