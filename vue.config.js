const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      entry: "src/pages/main.ts",
      template: "public/index.html",
      filename: "index.html",
      title: "overlay memo | Setting",
    },
    timeline: {
      entry: "src/pages/timeline.ts",
      template: "public/timeline.html",
      filename: "timeline.html",
      title: "overlay memo | Timeline",
    },
  },
  pluginOptions: {
    electronBuilder: {
      preload: {
        preloadTimeline: "src/preload/preloadTimeline.js",
        preloadSetting: "src/preload/preloadSetting.js",
      },
    },
  },
});
