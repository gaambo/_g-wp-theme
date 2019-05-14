# _g WordPress Theme

A boilerplate theme based on [Timber](https://github.com/timber/timber) making usage of [Gulp](http://gulpjs.com/) with [LibSass](http://sass-lang.com/), [Babel](https://babeljs.io/), [PostCSS](https://github.com/postcss/postcss), [BrowserSync](https://www.browsersync.io/) etc. Perfect for custom developed themes and working with [Advanced Custom Fields](https://www.advancedcustomfields.com/).

This boilerplate is also used in my [UnderscoreG WP](https://github.com/gaambo/underscoreg-wp) and [Cobblestone](https://github.com/gaambo/cobblestone-wp) boilerplates. You can find more information there.

## Installation

1. Clone the repository from Github into the `themes` directory or download the repository and unpack it into the `themes` folder.
2. Run `composer install` in the `themes` directory or `composer install -d path/to/themes/directory` from your project root if you have composer setup there too.
   
This theme serves as a boilerplate so there's no sense in keeping it as a git-submodule (except in other boilerplates).

## Deployment

Only files needed for production should be deployed to the production server. Here are some tips:

- Run `npm install` and `npm run build`/`gulp build` in your CI/CD. Then you only deploy the built assets in `assets` to production server and not
  - The `src` folder with source assets to pr
  - `package.json`, `package-lock.json`, `node_moduels`
  - `gulpfile.babel.js` and `gulp.config.js`
- Deploy assets with sourcemaps only in staging and testing environments
- Run `composer install --no-dev` in your CI/CD or on your production server (`vendor` directory should not be deployed per se).
- Other files to exclude/not deploy:
  - `LICENSE`
  - `phpcs.xml`
  - `README.md`
  - `.babelrc`
  - `.eslintignore`
  - `.eslintrc.json`
  - `.gitignore`
  - `.stylelintignore`
  - `.stylelintrc.json`
- Direct Access to `vendor` directory should be forbidden/disabled (via `.htaccess` or NGINX configuration)

## Why [...]?

### ESLint & StyleLint Configuration

I use [Prettier](https://prettier.io/) for (S)CSS and [Airbnb Javascript Style Guide](https://github.com/airbnb/javascript) in combination with Prettier in JavaScript. I think Prettier defines some sane guidelines and I just really like the Airbnb Javascript Style Guide. The [WordPress Coding Standards](https://make.wordpress.org/core/handbook/best-practices/coding-standards/javascript/) do not really work for me for multiple reasons (and I use Prettier + Airbnb in other Projects too). You can always change ESLint (`.eslintrc.json`) and StyleLint (`.stylelintrc.json`) configurtion to fit your personal preferences.
Personally I think if you don't develop for core you should always use modern coding style guides.

### PHP CS 

[WordPress Coding Standards](https://make.wordpress.org/core/handbook/best-practices/coding-standards/php/) do not use modern PHP. I use [PSR2](https://www.php-fig.org/psr/psr-2/) because they are the most common in PHP projects.
Personally I think if you don't develop for core you should always use modern coding style guides.

### OOP

I don't like forcing things into classes/objects if they are not really objects. I thinks namespaces are a perfect way to organize code and avoid polluting the global namespace / prefixing every function/class.

### Actions / Filters / Hooks

I don't like the idea of using a single "registry" class per theme/plugin to register all hooks. Instead in namespaced files functions are added to hooks directly after defining them - in classes I think it's best to do this in the constructors.

### Twig / Timber

Because seperating logic and view makes life easier. Also [Timber](https://github.com/timber/timber) provides some very useful helper.

### Directory Structure

Most of the times I work with WordPress I build complete sites. Therefore for a longe time all dependencies (npm, composer) were managed at the root level of the project (one level above document root). I still think this is a very good way, **but** since I manage two kinds of WordPress boilerplates ([Vanilla WP](https://github.com/gaambo/vanilla-wp) and [Cobblestone WP](https://github.com/gaambo/cobblestone-wp)) for different requirements (eg possibility to install dependencies outside of document root is not given with some hosters) I had to manage the boilerplate theme in two places. Now my boilerplate theme lives here and is used in both WordPress site boilerpaltes. In sites/projects managed with composer/Cobblestone/Bedrock I pull out the theme dependencies into the root directory. Also all development utils (ESLint, StyleLint, Gulp) are in the document root.