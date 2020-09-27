module.exports = {
  runtimeCompiler: true,
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        extraFiles: [
          {
            from: 'node_modules/win-7zip/7zip-lite/7z.exe',
            to: '7z.exe'
          }
        ]
      }
    }
  },
  transpileDependencies: ['vuetify']
};
