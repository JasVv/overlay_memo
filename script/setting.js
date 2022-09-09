window.myAppSetting.openJson().then((data) => {
  const vueApp = {
    data() {
      return {
        contents: data.contents,
        selected: data.contents[0],
        timelines: data.contents[0].timeline,
        newTime: '',
        newAction: '',
        newMemo: '',
      }
    },
    mounted() {

    },
    methods: {
      changeTransparent(e) {
        window.myAppSetting.changeTransparent(e.target.value);
      },
      changeContents(e) {
        this.selected = this.contents.find(element => element.id == e.target.value)
        this.timelines = this.selected.timeline
        window.myAppSetting.changeContents(e.target.value);
      },
      addTimeline() {
        if (this.newTime != '') {
          const newTimeline = {
            "time": this.newTime,
            "action": this.newAction,
            "memo": this.newMemo,
          }
          this.timelines.push(newTimeline)

          this.newTime = ''
          this.newAction = ''
          this.newMemo = ''

          const selectedIndex = this.contents.findIndex((e) => e.id == this.selected.id)
          this.contents[selectedIndex].timeline = this.timelines
          const newContents = {
            "contents": this.contents
          }

          window.myAppSetting.saveJson(JSON.stringify(newContents, null, 4)).then(() => {
            window.myAppSetting.changeContents(this.selected.id);
          })
        }
      }
    }
  }

  Vue.createApp(vueApp).mount('#app');
});
