# Gulp Opencart 3.x.x Modifications Refresh
Gulp Plugin for refresh Extension > Modifications (OCMOD) cache in OpenCart 3.x.x.


# Install

```
npm install gulp-ocmod-refresh --save-dev
```

# Usage in gulpfile

```javascript
let localhost      = 'localhost',    // Your local domain
    adminUrl       = 'admin',        // Path to admin
    adminLogin     = 'yourLogin',    // Admin login 
    adminPassword  = 'yourPassword', // Admin password
    fileswatch     = 'html,htm,php,js,css,txt,yaml,twig,json,md'
    
const {src, parallel, series, watch} = require('gulp')
const browserSync = require('browser-sync').create()
const ocmodRefresh = require('gulp-ocmod-refresh')

function browsersync() {
    browserSync.init({
        proxy: localhost,
        notify: false,
        online: true,
        open: true
    })
}

function modificationRefresh() {
    return src([
        './system/storage/**/*.ocmod.xml',
        './system/storage/modification/catalog/view/theme/**/template/**/*.*'
    ])
        .pipe(ocmodRefresh({
            url: `http://${localhost}/${adminUrl}/`,
            login: adminLogin,
            password: adminPassword
        }))
}

function startwatch() {
    watch(
        [`catalog/**/*.{${fileswatch}}`],
        {usePolling: true}, 
        modificationRefresh
    ).on('change', browserSync.reload)

exports.default = series(parallel(browsersync, startwatch));
