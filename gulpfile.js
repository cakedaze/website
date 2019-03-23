'use strict';

const gulp = require('gulp');
const path = require('path');

const filter = require('gulp-filter');
const htmlmin = require('gulp-htmlmin');
const image = require('gulp-image');
const postcss = require('gulp-postcss');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const responsive = require('gulp-responsive');

const autoprefixer = require('autoprefixer');
const customProperties = require('postcss-custom-properties');
const cssImport = require('postcss-import');
const cssnano = require('cssnano');
const customMedia = require('postcss-custom-media');
const declarationSorter = require('css-declaration-sorter');
const pseudoClassEnter = require('postcss-pseudo-class-enter');

const server = require('browser-sync').create();

const {
  getAboutData,
  getCakesData,
  getEventsData,
} = require('./helpers.js');

const netlifyCmsDir = path.parse(require.resolve('netlify-cms')).dir;

const paths = {
  html: {
    src: './src/views/*.pug',
    partials: './src/partials/**/*.pug',
    content: './content/*/*.md',
    dist: './dist/',
  },
  css: {
    src: ['./src/partials/**/**/*.css', './src/views/*.css'],
    dist: './dist/css/',
  },
  js: {
    src: './src/partials/**/*.js',
    dist: './dist/js',
  },
  media: {
    src: './src/assets/media/*.{svg,png,jpg}',
    dist: './dist/assets/media',
  },
  fonts: {
    src: './src/assets/fonts/*',
    dist: './dist/assets/fonts',
  },
  cms: {
    src: [
      path.join(netlifyCmsDir, 'cms.css'),
      path.join(netlifyCmsDir, 'cms.js'),
      path.join(netlifyCmsDir, '*.woff2'),
    ],
    dist: './dist/cms',
  },
  metaConfig: {
    src: [
      './content/config.yml',
      './src/robots.txt',
    ],
    dist: './dist/',
  }
};

gulp.task('build:html', function () {
  return gulp.src(paths.html.src)
    .pipe(pug({
      locals: {
        getAboutData,
        getCakesData,
        getEventsData,
      }
    }))
    .pipe(htmlmin({
      collapseWhitespace: true,
    }))
    .pipe(rename({
      extname: '.html',
    }))
    .pipe(gulp.dest(paths.html.dist))
    .pipe(server.stream());
});

gulp.task('build:css', function () {
  var cssProcessors = [
    cssImport(),
    customProperties(),
    customMedia(),
    autoprefixer(),
    cssnano(),
    pseudoClassEnter(),
  ];

  return gulp.src(paths.css.src, {
      since: gulp.lastRun('build:css')
    })
    .pipe(postcss(cssProcessors))
    .pipe(rename({
      dirname: '',
    }))
    .pipe(gulp.dest(paths.css.dist))
    .pipe(server.stream());
});

gulp.task('build:js', function () {
  return gulp.src(paths.js.src, {
      since: gulp.lastRun('build:js')
    })
    .pipe(rename({
      dirname: '',
    }))
    .pipe(gulp.dest(paths.js.dist));
});

gulp.task('build:media', function () {
  const responsiveImagesFilter = filter(['**/*.jpg'], {restore: true});

  return gulp.src(paths.media.src)
    .pipe(responsiveImagesFilter)
    .pipe(responsive({
      '*.jpg': {
        width: 1000,
      },
    }))
    .pipe(responsiveImagesFilter.restore)
    .pipe(image())
    .pipe(gulp.dest(paths.media.dist));
});

gulp.task('build:cms', function () {
  return gulp.src(paths.cms.src)
    .pipe(gulp.dest(paths.cms.dist));
});

gulp.task('build:metaConfig', function () {
  return gulp.src(paths.metaConfig.src)
    .pipe(gulp.dest(paths.metaConfig.dist));
});

gulp.task('build', gulp.parallel([
  'build:html',
  'build:css',
  'build:js',
  'build:media',
  'build:cms',
  'build:metaConfig',
]));

gulp.task('watch:html', function(done) {
  gulp.watch(
    [paths.html.src, paths.html.partials, paths.html.content],
    gulp.task('build:html')
  );
  done();
});

gulp.task('watch:css', function(done) {
  gulp.watch(paths.css.src, gulp.task('build:css'));
  done();
});

gulp.task('watch:js', function(done) {
  gulp.watch(paths.js.src, gulp.task('build:js'));
  done();
});

gulp.task('watch:media', function(done) {
  gulp.watch(paths.media.src, gulp.task('build:media'));
  done();
});

gulp.task('watch', gulp.parallel([
  'watch:html',
  'watch:css',
  'watch:js',
  'watch:media',
]));

gulp.task('format:fonts', function () {
  return gulp.src(paths.fonts.src, {
      since: gulp.lastRun('build:css'),
    })
    .pipe(gulp.dest(paths.fonts.dist));
});

gulp.task('format:css', function () {
  return gulp.src(paths.css.src, {
      since: gulp.lastRun('build:css'),
      base: './',
    })
    .pipe(postcss(
      [
        declarationSorter({
          order: 'smacss',
        }),
      ]
    ))
    .pipe(gulp.dest('.'));
});

gulp.task('format', gulp.parallel([
  'format:fonts',
  'format:css',
]));

gulp.task('server', function(done) {
  server.init({
    server: {
      baseDir: './dist/',
      serveStaticOptions: {
        extensions: ['html'],
      },
    },
    open: false,
  });

  done();
});

gulp.task(
  'default',
  gulp.parallel('server', gulp.series('format', 'build', 'watch'))
);
