module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Suppress source map warnings from node_modules
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
        /Can't resolve .* in .*node_modules/,
        /ENOENT: no such file or directory.*\.ts/,
      ];

      // Modify source-map-loader to exclude node_modules
      const sourceMapLoaderRule = webpackConfig.module.rules.find(
        (rule) => rule.enforce === 'pre' && rule.use && rule.use.some((use) => use.loader && use.loader.includes('source-map-loader'))
      );

      if (sourceMapLoaderRule) {
        sourceMapLoaderRule.exclude = /node_modules/;
      }

      return webpackConfig;
    },
  },
};

