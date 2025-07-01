const ReactCompilerConfig = {
  // You can restrict to certain directories with sources, or leave empty for all
  // sources: (filename) => filename.includes('src'),
};

module.exports = () => ({
  plugins: [
    ['babel-plugin-react-compiler', ReactCompilerConfig], // must run first!
    '@babel/plugin-syntax-jsx',
  ],
});
