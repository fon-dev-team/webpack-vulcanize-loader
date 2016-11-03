const path = require('path');
const expect = require('chai').expect;
const loader = require('../index');


describe("webpack-vulcanize-loader", function () {
    var content, err, emittedFiles;

    beforeEach(function () {
        process.chdir(path.resolve(__dirname));
        content = err = undefined;
        emittedFiles = {};
    });

    describe('when valid file supplied', function () {
        executeLoader('fixtures/loader.html');

        it("should not throw error", function () {
            expect(err).to.equal(null);
        });

        it("should generate a module dependency", function () {
            expect(content).to.equal('module.exports = __webpack_public_path__ + "loader.html";');
        });

        it("should emit vulcanized file", function () {
            expect(emittedFiles["loader.html"]).to.match(/^<html>/g);
            expect(emittedFiles["loader.html"]).to.contain('id="component"');
            expect(emittedFiles["loader.html"]).to.contain('id="component2"');
            expect(emittedFiles["loader.html"]).to.match(/<\/html>$/g);
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

    describe('when cache available', function () {
        it("should try to cache vulcanized file", function (done) {
            loader.call({
                resourcePath: 'fixtures/invalid.html',
                options: {
                    context: path.resolve(__dirname, 'fixtures')
                },
                emitFile: function (url, content) {
                    emittedFiles[url] = content;
                },
                cacheable: function () {
                    done();
                }
            });
        })
    });

    describe('when no emitFile available', function () {
        it("should throw error", function () {
            expect(function () {
                loader.call({});
            }).to.throw('emitFile is required for vulcanizing')
        })
    });

    describe('when invalid file supplied', function () {
        beforeEach(function (done) {
            loader.call({
                resourcePath: 'fixtures/invalid.html',
                options: {
                    context: path.resolve(__dirname, 'fixtures')
                },
                emitFile: function (url, content) {
                    emittedFiles[url] = content;
                },
                async: function () {
                    return function (_err, _content) {
                        content = _content;
                        err = _err;
                        done();
                    };
                }
            });
        });

        it('should throw error', function () {
            expect(err).to.be.defined;
        })
    });

    describe('when no styles found', function () {
        executeLoader('fixtures/no-styles.html');

        it("should not throw error", function () {
            expect(err).to.equal(null);
        });

        it("should generate a module dependency", function () {
            expect(content).to.equal('module.exports = __webpack_public_path__ + "no-styles.html";');
        });

        it("should emit vulcanized file", function () {
            expect(emittedFiles["no-styles.html"]).to.match(/^<html>/g);
            expect(emittedFiles["no-styles.html"]).to.contain('id="no-styles"');
            expect(emittedFiles["no-styles.html"]).to.match(/<\/html>$/g);
        });

        it('should not add dependencies', function () {
            expect(Object.keys(emittedFiles).length).to.equal(1);
            expect(emittedFiles['no-styles.html']).to.be.defined;
        });
    });

    describe('when no style urls found', function () {
        executeLoader('fixtures/no-urls.html');

        it("should not throw error", function () {
            expect(err).to.equal(null);
        });

        it("should generate a module dependency", function () {
            expect(content).to.equal('module.exports = __webpack_public_path__ + "no-urls.html";');
        });

        it("should emit vulcanized file", function () {
            expect(emittedFiles["no-urls.html"]).to.match(/^<html>/g);
            expect(emittedFiles["no-urls.html"]).to.contain('id="no-urls"');
            expect(emittedFiles["no-urls.html"]).to.match(/<\/html>$/g);
        });

        it('should not add dependencies', function () {
            expect(Object.keys(emittedFiles).length).to.equal(1);
            expect(emittedFiles['no-urls.html']).to.be.defined;
        });
    });

    afterEach(function () {
        process.chdir(path.resolve(__dirname, '..'));
    });

    function executeLoader(resourcePath) {
        beforeEach(function (done) {
            loader.call({
                resourcePath: resourcePath,
                options: {
                    context: path.resolve(__dirname, 'fixtures')
                },
                emitFile: function (url, content) {
                    emittedFiles[url] = content;
                },
                async: function () {
                    return function (_err, _content) {
                        content = _content;
                        err = _err;
                        done();
                    };
                }
            });
        });
    }
});
