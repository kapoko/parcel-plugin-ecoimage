module.exports = function(bundler) {
    bundler.addAssetType('jpg', require.resolve('./lib/ecoimage-asset.js'));
    bundler.addAssetType('jpeg', require.resolve('./lib/ecoimage-asset.js'));  
};