# vigour-is
<!-- VDOC.badges travis; standard; npm; coveralls -->
<!-- DON'T EDIT THIS SECTION (including comments), INSTEAD RE-RUN `vdoc` TO UPDATE -->
[![Build Status](https://travis-ci.org/vigour-io/is.svg?branch=master)](https://travis-ci.org/vigour-io/is)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm version](https://badge.fury.io/js/vigour-is.svg)](https://badge.fury.io/js/vigour-is)
[![Coverage Status](https://coveralls.io/repos/github/vigour-io/is/badge.svg?branch=master)](https://coveralls.io/github/vigour-io/is?branch=master)

<!-- VDOC END -->

`.is` api for observables (observes until a value fulfils conditions) build in promise support

```javascript
  // add a once listener
  obs.is('something', () => {
    console.log('fire!')
  })

  // fire!
  obs.set('something')

  // fire immediatly
  obs.is('something', () => {
    console.log('fire!')
  })

  // fire immmediatly, as a promise
  obs.is('something').then(() => {
    console.log('fire')
  })
```