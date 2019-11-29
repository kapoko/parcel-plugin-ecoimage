const path = require('path');
const assertBundleTree = require('parcel-assert-bundle-tree');
const Bundler = require('parcel-bundler');

const EcoImagePlugin = require('../index');

describe('basic', function() {
    it('should work', async function() {
        const bundler = new Bundler(path.join(__dirname, './Integration/Basic/index.html'), Object.assign({
            outDir: path.join(__dirname, 'dist'),
            watch: false,
            cache: false,
            hmr: false,
            logLevel: 0,
            minify: true
        }));

        // Registers the plugins asset types
        await EcoImagePlugin(bundler);

        const bundle = await bundler.bundle();
        console.log(bundle.childBundles);

        // Compare bundle to expected
        assertBundleTree(bundle, {
            name: 'index.html',
            assets: ['index.html'],
            childBundles: [
                {
                    type: 'png',
                    assets: ['test.jpg'],
                }
            ]
        });

    });
});