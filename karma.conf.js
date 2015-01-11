module.exports = function(config) {
  config.set({
    browsers : ['Chrome', 'Firefox'],
    frameworks: ['jasmine'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome', 'Firefox'],
    singleRun: true    
  });
};