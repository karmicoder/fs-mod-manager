module.exports = {
  runtimeCompiler: process.env.NODE_ENV !== 'production',
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js'
    }
  }
};
