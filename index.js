var fs = require('fs');
var path = require('path');
var loaderUtils = require('loader-utils');
var Vulcanize = require('vulcanize');


module.exports = function () {

    if (!this.emitFile) throw new Error("emitFile is required for vulcanizing");

    var loader = this;
    var query = loaderUtils.parseQuery(this.query);
    this.cacheable && this.cacheable();

    var callback = this.async();

    function processVulcanizedStyles(content) {
        var assets = {};

        (content.match(/<style>[.\s\S]*?<\/style>/gm) || [])
            .forEach(function (style) {
                style = style.replace(/(\/\/.*)|(\/\*[.*\s\S]*?\*\/)/g, '');
                var parsed = style, assetUri, assetContent, interpolatedUri;
                (style.match(/url\(".*?"\)/g) || []).forEach(function (assetUrl) {
                    assetUri = assetUrl.replace(/^.*?"/, '').replace(/(\??#.*)?".*$/, '');

                    if (!assets[assetUri]) {
                        assetContent = fs.readFileSync(path.resolve(loader.options.context, assetUri));
                        interpolatedUri = loaderUtils.interpolateName(
                            {
                                resourcePath: assetUri
                            },
                            query.assetName || 'assets/[name].[ext]',
                            {
                                context: loader.options.context,
                                content: assetContent
                            });

                        assets[assetUri] = {
                            content: assetContent,
                            interpolated: interpolatedUri,
                            publicPath: "__webpack_public_path__ + " + JSON.stringify(interpolatedUri)
                        };

                        loader.emitFile(interpolatedUri, assetContent);
                    }

                    parsed = parsed.replace(assetUrl, assetUrl.replace(assetUri, assets[assetUri].interpolated));
                });

                content = content.replace(style, parsed);
            });
        return content;
    }

    var processVulcanizedProps = function (query) {
        return {
            stripExcludes: query.stripExcludes || false,
            inlineScripts: query.inlineScripts || false,
            inlineCss: query.inlineCss || false,
            stripComments: query.stripComments || false
        };
    };

    new Vulcanize(processVulcanizedProps(query)).process(this.resourcePath, function (err, content) {
        if (err) {
            callback(err);
            return;
        }

        content = processVulcanizedStyles(content);

        var url = loaderUtils.interpolateName(loader, query.name || '[name].[ext]', {
            context: loader.options.context,
            content: content
        });

        var publicPath = "__webpack_public_path__ + " + JSON.stringify(url);

        loader.emitFile(url, content);

        callback(null, 'module.exports = ' + publicPath + ';')
    });
}
