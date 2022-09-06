const transparentRange = document.getElementById('transparent')

transparentRange.addEventListener('input', () => {
  console.log(transparentRange.value);
  window.myAppSetting.changeTransparent(transparentRange.value);
})
