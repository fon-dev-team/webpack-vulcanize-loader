# Webpack Polymer Vulcanize loader

This package exposes a Webpack loader to generate vulcanized html imports and its file dependencies.

### USAGE

1. Install the package:

``` bash
    $ npm install -D webpack-vulcanize-loader
```

2. Add a dependency for your loader in index.html

``` html

<html>
<head>
...
<link rel="import" href="${require('./polymer-loader.html')}" />
...
</head>
<body>
....
</body>
</html>


```

3. Add the loader to your webpack.config.json and exclude your main html loader and index from html plugin

``` javascript

{
    ...
    
    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: 'html',
                exclude: [
                    /polymer-loader\.html/,
                    /index\.html/
                ]
            },
            {
                test: /polymer-loader\.html$/,
                loader: 'webpack-vulcanize?name=[name].[hash].[ext]&assetName=assets/[name].[hash].[ext]'
            }
        ]
    },
    
    ...
}


```


### Loader Query options

**name:**: Generated vulcanized file name pattern
**assetName:**: Generated asset file dependency name pattern (images, fonts, etc)
