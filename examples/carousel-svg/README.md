This carousel example uses `style transform` and `transition` to rotate a group of SVG triangles.

Also, the color of each triangle changes when you hover or click/tap it.

I built the build.js using npm and browserify. 

In my local copy of the snabbdom project root I did these preparations:
```
npm install --save-dev babelify
npm install --save-dev babel-preset-es2015
echo '{ "presets": ["es2015"] }' > .babelrc
```

I then built like this:
```
browserify examples/carousel-svg/script.js -t babelify -o examples/carousel-svg/build.js
```

-- *jk*
