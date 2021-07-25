const path = require('path')

module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  experiments:{
    topLevelAwait: true
  },images: {
    domains: ['images.picturehouse.be'],
  },
}