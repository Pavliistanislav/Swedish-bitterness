"use strict"

let { src, dest } = require("gulp"),
  gulp = require("gulp"),
  autoprefixer = require("gulp-autoprefixer"),
  cssbeautify = require("gulp-cssbeautify"),
  removeComments = require("gulp-strip-css-comments"),
  rename = require("gulp-rename"),
  sass = require("gulp-sass"),
  cssnano = require("gulp-cssnano"),
  rigger = require("gulp-rigger"),
  uglify = require("gulp-uglify"),
  plumber = require("gulp-plumber"),
  imagemin = require("gulp-imagemin"),
  del = require("del"),
  panini = require("panini"),
  concat = require("gulp-concat"),
  browsersync = require("browser-sync").create()

/* Paths to source/build/watch files
=========================*/

var path = {
  build: {
    html: "dist/",
    js: "dist/js/",
    scss: "dist/css/",
    images: "dist/images/",
    fonts: "dist/fonts",
  },
  src: {
    html: "src/*.{htm,html}",
    js: "src/assets/js/*.js",
    scss: "src/assets/sass/*.scss",
    images: "src/assets/images/**/*.{jpg,png,svg,gif,ico}",
    fonts: "src/assets/fonts/**/*.ttf",
  },
  watch: {
    html: "src/**/*.{htm,html,php}",
    js: "src/assets/js/**/*.js",
    scss: "src/assets/sass/**/*.scss",
    images: "src/assets/images/**/*.{jpg,png,svg,gif,ico}",
  },
  clean: "./dist",
}

/* Tasks
=========================*/

const browserSync = (done) => {
  browsersync.init({
    server: {
      baseDir: "./dist/",
    },
    notify: false,
    port: 3000,
    //online: false, // Work offline without internet connection
    //tunnel: true,
    //tunnel: 'mmyproject' // Demonstration page: http://projectname.localtunnel.me
  })
  done()
}

// const browserSyncReload = (done) => {
//     browsersync.reload();
//     done();
// }

const html = () => {
  panini.refresh()
  return src(path.src.html, { base: "src/" })
    .pipe(plumber())
    .pipe(
      panini({
        root: "src/",
        layouts: "src/tpl/layouts/",
        partials: "src/tpl/partials/",
        helpers: "src/tpl/helpers/",
        data: "src/tpl/data/",
      }),
    )
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

const scss = () => {
  return src(path.src.scss, { base: "./src/assets/sass/" })
    .pipe(plumber())
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 8 versions"],
        cascade: true,
      }),
    )
    .pipe(cssbeautify())
    .pipe(dest(path.build.scss))
    .pipe(
      cssnano({
        zindex: false,
        discardComments: {
          removeAll: true,
        },
      }),
    )
    .pipe(removeComments())
    .pipe(
      rename({
        suffix: ".min",
        extname: ".css",
      }),
    )
    .pipe(dest(path.build.scss))
    .pipe(browsersync.stream())
}

const css = () => {
  return gulp.src([]).pipe(concat("_libs.scss")).pipe(dest("src/assets/sass/")).pipe(browsersync.stream())
}

const js = () => {
  return src(path.src.js, { base: "./src/assets/js/" })
    .pipe(plumber())
    .pipe(rigger())
    .pipe(gulp.dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        suffix: ".min",
        extname: ".js",
      }),
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

const script = () => {
  return gulp
    .src(["node_modules/slick-slider/slick/slick.js"])
    .pipe(concat("libs.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("src/assets/js/libs"))
    .pipe(browsersync.stream())
}

const images = async () => {
  return src(path.src.images)
    .pipe(dest(path.build.images))
    .pipe(src(path.src.images))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3, //0-7
      }),
    )
    .pipe(dest(path.build.images))
    .pipe(browsersync.stream())
}

const fonts = () => {
  return src(path.src.fonts)
    .pipe(dest(path.build.fonts))
}

const clean = () => {
  return del(path.clean)
}

const watchFiles = () => {
  gulp.watch([path.watch.html], html)
  gulp.watch([path.watch.scss], scss)
  //gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js)
  //gulp.watch([path.watch.script], script);
  gulp.watch([path.watch.images], images)
}

const build = gulp.series(clean, gulp.parallel(html, scss, js, images, fonts))
const watch = gulp.parallel(build, watchFiles, browserSync)

// export tasks
exports.html = html
exports.scss = scss
//exports.css = css;
exports.js = js
//exports.script = script;
exports.images = images
exports.fonts = fonts
exports.clean = clean
exports.build = build
exports.watch = watch
exports.default = watch
