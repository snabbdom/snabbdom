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
