const transparentRange = document.getElementById('transparent')

transparentRange.addEventListener('input', () => {
  window.myAppSetting.changeTransparent(transparentRange.value);
})

const selectContents = document.getElementById('contents')

selectContents.addEventListener('change', () => {
  window.myAppSetting.changeContents(selectContents.value);
})

window.myAppSetting.openJson().then((data) => {
  const vueApp = {
    data() {
      return {
        contents: data.contents,
      }
    },
    mounted() {

    },
    methods: {
      changeContents(e) {
        window.myAppSetting.changeContents(e.target.value);
      },
    }
  }

  Vue.createApp(vueApp).mount('#app');
});