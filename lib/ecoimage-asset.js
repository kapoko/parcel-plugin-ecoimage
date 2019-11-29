const path = require('path');
const { Asset } = require('parcel-bundler');

const gm = require('gm').subClass({imageMagick: true});
const URL = require('url');

/**
 * Joins a path onto a URL, and normalizes Windows paths
 * e.g. from \path\to\res.js to /path/to/res.js.
 */
function urlJoin(publicURL, assetPath) {
    const url = URL.parse(publicURL, false, true);
    const assetUrl = URL.parse(assetPath);
    url.pathname = path.posix.join(url.pathname, assetUrl.pathname);
    url.search = assetUrl.search;
    url.hash = assetUrl.hash;
    return URL.format(url);
};

class EcoImageAsset extends Asset {
    constructor(...args) {
        super(...args);
        this.type = 'png';
        this.encoding = null;
    }

    packageImage(location) {
        return new Promise((resolve, reject) => {
            gm(location)
                .resize('600x600\>')
                .colorspace('Gray')
                .orderedDither('o8x8,4')
                .alpha('background')
                .strip()
                .toBuffer('png', function(err, buffer) {
                    if (err) return reject(err)
                    resolve(buffer);
                });
        });
    }

    convertToWebp(buffer) {
        return new Promise((resolve, reject) => {
            gm(buffer)
                .define('webp:lossless=true')
                .toBuffer('webp', function(err, buffer) {
                    if (err) return reject(err)
                    resolve(buffer);
                });
        });
    }
        

    async transform() {
        this.pngData = await this.packageImage(this.name);
        this.webpData = await this.convertToWebp(this.pngData);
    }

    async generate() {
        // Don't return a URL to the JS bundle if there is a bundle loader defined for this asset type.
        // This will cause the actual asset to be automatically preloaded prior to the JS bundle running.
        if (this.options.bundleLoaders[this.type]) {
            return {};
        }

        const pathToAsset = urlJoin(this.options.publicURL, this.generateBundleName());

        return [
            {
                type: 'js',
                value: `module.exports=${JSON.stringify(pathToAsset)};`,
                hasDependencies: false
            },
            {
                type: this.type,
                value: this.pngData || null,
                hasDependencies: false
            }, 
            {
                type: 'webp',
                value: this.webpData || null,
                hasDependencies: false
            },
        ];
    }
}

module.exports = EcoImageAsset;