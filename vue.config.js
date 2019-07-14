module.exports = {
  chainWebpack: config => {
    config.module.rules.delete("svg");
  },
  configureWebpack: {
    devServer: {
      host: "thenutz.player",
      inline: true,
      port: 7788,
      https: true,
      public: "thenutz.player",
      disableHostCheck: true,
      clientLogLevel: "info",
      watchOptions: {
        poll: true
      }
    },
    module: {
      rules: [
        {
          test: /\.svg$/,
          loader: "vue-svg-loader"
        }
      ]
    }
  }
};
