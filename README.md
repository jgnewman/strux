# Gulp-React Starter

A basic, mostly un-opinionated starter package for building React apps using
Gulp. Contains support for Bootstrap, SCSS, ES6, Express, Socket.io, and jQuery.

## To Use...

1. Download this repo.
2. Run `npm install`.
3. Modify locations in `gulpconfig.json`.
4. Run `npm start` to start up a server.

## Config

The `gulpconfig.json` file assumes your application contains the following:

- `index` - A main index.html file as an entry point for users into your app.
- `appSrc` - A tree'd directory structure containing all of your front-end JS.
- `appEntry` - A single JS file as an entry point for pulling in all of your front-end JS files.
- `appOutput.fileName` - The name of finalized, concatenated, front-end file.
- `appOutput.dest` - The destination directory of the finalized front-end file.
- `styleSrc` - A tree'd directory structure containing all of your SCSS.
- `stylesEntry` - A single SCSS file as an entry point for pulling in all of your SCSS.
- `stylesOutput.dest` - The destination directory of the compiled CSS.
- `serverSrc` - A tree'd directory structure containing all of your server files.
- `serverPort` - A port to run the server on.
- `gulpfile` - The location of your gulpfile.
- `package` - The location of your package.json file.
- `config` - The location of your gulpconfig.json file.
- `useBrowserHistory` - Boolean. Whether or not you are going to use browserHistory with React Router.
