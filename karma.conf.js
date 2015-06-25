module.exports = function(config) {
  config.set({
    files: ['lib/*.js'].concat('test/**/*_spec.js'),
    browsers : ['Chrome'], // for some reason, x-tag tests are not working with Firefox
    frameworks: ['jasmine'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    singleRun: true
  });
};