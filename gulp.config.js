export default {
  srcDir: "./src",
  dstDir: "./assets",
  styles: {
    srcDir: "./src/css",
    src: "main.scss",
    dstDir: "./assets/css",
    prefixBrowsers: ["last 2 versions", "> 2%"]
  },
  scripts: {
    srcDir: "./src/js",
    src: "**/*.js",
    dstDir: "./assets/js",
    babelPreset: "@babel/preset-env",
    bundleName: "bundle",
    requires: []
  },
  images: {
    srcDir: "./src/images",
    dstDir: "./assets/images"
  },
  translate: {
    srcDir: "./",
    src: ["includes/**/*.php", "templates/**/*.php", "*.php", "!vendor"],
    twigFiles: ["templates/**/*.twig"],
    dstDir: "./languages",
    cacheFolder: ".cache"
  },
  otherFiles: [
    // examples:
    // "./src/fonts/**/*",
    // {
    //   origPath: ["node_modules/optinout.js/dist/optinout.js"],
    //   path: "web/app/themes/efs/assets/libs/"
    // },
    // {
    //   origPath: ["node_modules/optinout.js/dist/optinout.js"],
    //   base: "node_modules/optinout.js",
    //   path: "web/app/themes/efs/assets/libs/"
    // }
  ]
};
