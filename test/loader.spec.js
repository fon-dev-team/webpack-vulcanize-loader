const path = require('path');
const expect = require('chai').expect;
const loader = require('../index');


describe("webpack-vulcanize-loader", function () {
    var content, err, emittedFiles = {};

    beforeEach(function (done) {
        process.chdir(path.resolve(__dirname));

        loader.call({
            resourcePath: 'fixtures/loader.html',
            options: {
                context: path.resolve(__dirname, 'fixtures'),
            },
            emitFile: function (url, content) {
                emittedFiles[url] = content;
            },
            async: function () {
                return function (_err, _content) {
                    done();
                    content = _content;
                    err = _err;
                };
            }
        });
    });

    it("should not throw error", function () {
        expect(err).to.be.undefined;
    });

    it("should generate a module dependency", function () {
        expect(content).to.equal('module.exports = __webpack_public_path__ + "loader.html";');
    });

    it("should emit vulcanized file", function () {
        expect(/^<html>.*<\/html>$/g.test(emittedFiles["loader.html"])).to.equal(true);
        expect(emittedFiles["loader.html"]).to.contain('id="component"');
        expect(emittedFiles["loader.html"]).to.contain('id="component2"');
    });

    it("should emit asset dependencies", function () {
        expect(emittedFiles['assets/logo.png']).to.be.definded;
        expect(emittedFiles['assets/background.png']).to.be.definded;
    });

    it("should not output style urls", function () {
        expect(emittedFiles["loader.html"]).not.to.contain('url("img/logo.png")');
        expect(emittedFiles["loader.html"]).not.to.contain('url("img/background.png")');
    });

    it("should replace style urls to requires", function () {
        expect(emittedFiles["loader.html"]).to.contain('url("assets/logo.png")');
    });

    it("should replace style urls to requires without remove queries", function () {
        expect(emittedFiles["loader.html"]).to.contain('url("assets/logo.png?#iefix")');
        expect(emittedFiles["loader.html"]).to.contain('url("assets/logo.png#iefix")');
    });
});
