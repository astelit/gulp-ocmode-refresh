const request = require('request');
const through = require('through2').obj;
const gutil = require('gulp-util');
const getQueryParam = require('get-query-param');

let options;
let cookie_jar = request.jar();

function getKey() {
    return new Promise((resolve, reject) => {
        console.log('connecting to: ', options.url);
        request({

            url: options.url,
            jar: cookie_jar,
            method: 'POST',
            form: {
                username: options.login,
                password: options.password
            }
        })
            .on('response', (response) => {

                if (typeof response.headers.location === 'undefined')
                    reject("Can't get user token. Login or password incorrect");

                else {
                    resolve(getQueryParam('user_token', response.headers.location));
                }

            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

function refreshCache(key) {
    console.log('user_token for refresh modification: ', key);
    return new Promise((resolve, reject) => {
        request({
            url: options.url + '/index.php?route=marketplace/modification/refresh&user_token=' + key,
            jar: cookie_jar,
            method: 'GET'
        })
            .on('response', (response) => {
                resolve(true);
            })

            .on('error', (err) => {
                reject(err);
            });
    });
}

function logout(key) {
    return new Promise((resolve, reject) => {
        request({
            url: options.url + '/index.php?route=common/logout&token=' + key,
            jar: cookie_jar,
            method: 'GET'
        })
            .on('response', (response) => {
                console.log('<=Logout>=');
                resolve(true);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

function modificationRefresh(setting) {
    if (!setting.url) {
        throw new gutil.PluginError('gulp-ocmod-refresh', '`url` is required!');
    }
    if (!setting.login) {
        throw new gutil.PluginError('gulp-ocmod-refresh', '`login` is required!');
    }
    if (!setting.password) {
        throw new gutil.PluginError('gulp-ocmod-refresh', '`password` is required!');
    }
    options = setting;
    getKey()
        .then(refreshCache)
        .then(logout)
        .then((result) => {
            (result) ? console.log('modification-refresh -> completed') : console.log('modification-refresh -> Something wrong');
        })
        .catch((error) => {
            throw new gutil.PluginError('gulp-ocmod-refresh', error);
        });
    return through(function (file, encoding, callback) {
        callback(null, file);
    });
}

module.exports = modificationRefresh;
