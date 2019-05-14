import gulp from "gulp";
import path from "path";
import merge from "merge-stream";
import del from "del";
import filter from "gulp-filter";
import concat from "gulp-concat"; // Concatenates JS files.
import uglifyJS from "gulp-uglify"; // Minifies JS files.
import babel from "gulp-babel"; // Compiles ESNext to browser compatible JS.
import plumber from "gulp-plumber"; // Prevent pipe breaking caused by errors from gulp plugins.
import rename from "gulp-rename"; // Renames files E.g. style.css -> style.min.css.
import replace from "gulp-replace";
import sourcemaps from "gulp-sourcemaps"; // Maps code in a compressed file (E.g. style.css) back to it’s original position in a source file (E.g. structure.scss, which was later combined with other css files to generate style.css).
import sass from "gulp-sass"; // Gulp plugin for Sass compilation.
import uglifyCSS from "gulp-uglifycss"; // Minifies CSS files.
import autoprefixer from "gulp-autoprefixer"; // Autoprefixing magic.
import notify from "gulp-notify";
import imagemin from "gulp-imagemin"; // Minify PNG, JPEG, GIF and SVG images with imagemin.

import sort from "gulp-sort"; // Recommended to prevent unnecessary changes in pot-file.
import wpPot from "gulp-wp-pot"; // For generating the .pot file.

import config from "./gulp.config";

/**
 * An error handler method to be used with plumber. Sends a notification via {@link gulp-notify}.
 */
const errorHandler = r => {
  notify.onError("❌ ERROR: <%= error.message %>\n")(r);
};

/**
 * __
 * _e
 * _x
 * _xn
 * _ex
 * _n_noop
 * _nx_noop
 * translate  -> Match __,  _e, _x and so on
 * \(         -> Match (
 * \s*?       -> Match empty space 0 or infinite times, as few times as possible (ungreedy)
 * ['"]     -> Match ' or "
 * .+?        -> Match any character, 1 to infinite times, as few times as possible (ungreedy)
 * ,          -> Match ,
 * .+?        -> Match any character, 1 to infinite times, as few times as possible (ungreedy)
 * \)         -> Match )
 */
const gettextRegex = {
  // _e( "text", "domain" )
  // __( "text", "domain" )
  // translate( "text", "domain" )
  // esc_attr__( "text", "domain" )
  // esc_attr_e( "text", "domain" )
  // esc_html__( "text", "domain" )
  // esc_html_e( "text", "domain" )
  simple: /(__|_e|translate|esc_attr__|esc_attr_e|esc_html__|esc_html_e)\(\s*?['"].+?['"]\s*?,\s*?['"].+?['"]\s*?\)/g,

  // _n( "single", "plural", number, "domain" )
  plural: /_n\(\s*?['"].*?['"]\s*?,\s*?['"].*?['"]\s*?,\s*?.+?\s*?,\s*?['"].+?['"]\s*?\)/g,

  // _x( "text", "context", "domain" )
  // _ex( "text", "context", "domain" )
  // esc_attr_x( "text", "context", "domain" )
  // esc_html_x( "text", "context", "domain" )
  // _nx( "single", "plural", "number", "context", "domain" )
  disambiguation: /(_x|_ex|_nx|esc_attr_x|esc_html_x)\(\s*?['"].+?['"]\s*?,\s*?['"].+?['"]\s*?,\s*?['"].+?['"]\s*?\)/g,

  // _n_noop( "singular", "plural", "domain" )
  // _nx_noop( "singular", "plural", "context", "domain" )
  noop: /(_n_noop|_nx_noop)\((\s*?['"].+?['"]\s*?),(\s*?['"]\w+?['"]\s*?,){0,1}\s*?['"].+?['"]\s*?\)/g
};

/**
 * Fake Twig Gettext Compiler
 *
 * Searches and replaces all occurences of __('string', 'domain'), _e('string', 'domain') and so on,
 * with <?php __('string', 'domain'); ?> or <?php _e('string', 'domain'); ?> and saves the content
 * in a .php file with the same name in the cache folder.
 *
 * Functions supported:
 *
 * Simple: __(), _e(), translate()
 * Plural: _n()
 * Disambiguation: _x(), _ex(), _nx()
 * Noop: _n_loop(), _nx_noop()
 */
const compileTwigs = () => {
  const cacheFolder = path.join(
    config.translate.srcDir,
    config.translate.cacheFolder
  );
  let twigFiles = Array.isArray(config.translate.twigFiles) // ensure src is array
    ? config.translate.twigFiles
    : [config.translate.twigFiles];
  twigFiles = twigFiles.map(p => path.join(config.translate.srcDir, p)); // prefix srcDir

  del.bind(null, [cacheFolder], { force: true });
  // Iterate over .twig files
  return (
    gulp
      .src(twigFiles)
      // Search for Gettext function calls and wrap them around PHP tags.
      .pipe(replace(gettextRegex.simple, match => `<?php ${match}; ?>`))
      .pipe(replace(gettextRegex.plural, match => `<?php ${match}; ?>`))
      .pipe(replace(gettextRegex.disambiguation, match => `<?php ${match}; ?>`))
      .pipe(replace(gettextRegex.noop, match => `<?php ${match}; ?>`))
      // Rename file with .php extension
      .pipe(
        rename({
          extname: ".php"
        })
      )
      // Output the result to the cache folder as a .php file.
      .pipe(gulp.dest(cacheFolder))
  );
};

/**
 * Copies some other files (e.g. used for fonts, font-awesome icons,...) into the dist directory
 */
export const copyOtherFiles = done => {
  if (!config.otherFiles || config.otherFiles.length <= 0) {
    return done();
  }
  const parsedFiles = [];

  /**
   * Parses an array of files to copy.
   * The files are often defined in an `assets.json` or `build.json` and can have the following formats.
   * The files configuration can be passed as string or object.
   * If it's a string this string/glob will be used as src and the function will try to build a base if it has wildcards. The destination will be null (should be set by gulp.dest)
   * If it's an object the origPath and path will be used for src and dest, base is optional and will not be built.
   * The returned array can be used to build multiple gulp streams with {@link merge-stream}. See the example gulpfile.
   * @see examples directory for example configurations.
   *
   * @param {Object[]|string[]} files Different file configs to parse. If string can be a glob to pass to gulp.
   * @param {string} files[].origPath The source path of the file to copy.
   * @param {string} [files[].base] The base path to use for gulp.src
   * @param {string} files[].path The destination path to copy the file too.
   * @returns {Object[]} Array of file objects to be used in a gulp task. Each Object has a src, base and dest property.
   */
  config.otherFiles.forEach(el => {
    if (typeof el === "object") {
      parsedFiles.push({
        src: el.origPath,
        base: el.base || null,
        dest: el.path
      });
    } else {
      let srcPath = el;
      const wildcardPosition = el.indexOf("*");
      if (wildcardPosition) {
        srcPath = el.substring(0, wildcardPosition);
      }

      const baseDir = path.dirname(srcPath);
      parsedFiles.push({
        src: el,
        base: baseDir || null,
        dest: null
      });
    }
  });

  const tasks = [];

  parsedFiles.forEach(fileSet => {
    tasks.push(
      gulp
        .src(fileSet.src, { base: fileSet.base || null })
        .pipe(gulp.dest(fileSet.dest || config.dstDir))
    );
  });

  return merge(tasks);
};

/**
 * Concatenate, compiles and minifies scripts and adds sourcemaps.
 */
export const scripts = () => {
  let paths = Array.isArray(config.scripts.src) // ensure src is array
    ? config.scripts.src
    : [config.scripts.src];
  paths = paths.map(p => path.join(config.scripts.srcDir, p)); // prefix srcDir
  if (config.scripts.requires) {
    // if external libs/vendor libs insert them before other scripts in bundle
    paths.unshift(...config.scripts.requires);
  }
  return gulp
    .src(paths)
    .pipe(plumber({ errorHandler }))
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: [[config.scripts.babelPreset]]
      })
    )
    .pipe(concat(`${config.scripts.bundleName}.js`))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(config.scripts.dstDir))
    .pipe(filter("**/*.js")) // remove maps from stream
    .pipe(rename({ suffix: ".min" }))
    .pipe(uglifyJS())
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(config.scripts.dstDir));
};

/**
 * Concatenate, compiles and minifies stiles and adds sourcemaps.
 */
export const styles = () =>
  gulp
    .src(path.join(config.styles.srcDir, config.styles.src), {
      base: config.styles.srcDir
    })
    .pipe(plumber({ errorHandler }))
    .pipe(sourcemaps.init())
    .pipe(sass({ includePaths: ["node_modules"] }))
    .pipe(autoprefixer(config.styles.prefixBrowsers))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(config.styles.dstDir))
    .pipe(filter("**/*.css")) // remove maps from stream
    .pipe(rename({ suffix: ".min" }))
    .pipe(uglifyCSS())
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(config.styles.dstDir));

/**
 * Optimizes all images
 */
export const optimizeImages = () =>
  gulp
    .src(path.join(config.images.srcDir, "**/*"), {
      base: config.images.srcDir
    })
    .pipe(plumber({ errorHandler }))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
        })
      ])
    )
    .pipe(gulp.dest(config.images.dstDir));

/**
 * Translates WordPress php files to pot files.
 */
export const translateWordPress = done => {
  return gulp.series(compileTwigs, () => {
    let paths = Array.isArray(config.translate.src) // ensure src is array
      ? config.translate.src
      : [config.translate.src];
    if (config.translate.cacheFolder)
      paths.push(`${config.translate.cacheFolder}/**/*.php`);
    paths = paths.map(p => path.join(config.translate.srcDir, p)); // prefix srcDir
    return gulp
      .src(paths)
      .pipe(plumber({ errorHandler }))
      .pipe(sort())
      .pipe(wpPot())
      .pipe(gulp.dest(path.join(config.translate.dstDir, "translation.pot")));
  })(done);
};

/**
 * Cleans the dist directory.
 */
export const clean = () =>
  del([`${config.dstDir}/**/*`, `!${config.dstDir}/.gitkeep`]);

/**
 * Watches CSS, JS and image directories for changes and calls the respective task.
 */
const watch = () => {
  gulp.watch(`${config.styles.srcDir}/**/*.scss`, styles);
  gulp.watch(`${config.scripts.srcDir}/**/*.js`, scripts);
  gulp.watch(`${config.images.srcDir}/**/*`, optimizeImages);
};

/**
 * Build Task: Clean dist directory, copy other files (before everything else if src files depend on it) and build scripts, styles, images and translations.
 */
export const build = done =>
  gulp.series(
    clean,
    copyOtherFiles,
    gulp.parallel(scripts, styles, optimizeImages, translateWordPress)
  )(done);

/**
 * Develop Task: Call build task (see above) and watch for changes.
 */
export const develop = done => gulp.series(build, watch)(done);

/**
 * Export develop task as default.
 */
export default develop;
