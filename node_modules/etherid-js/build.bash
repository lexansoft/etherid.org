#!/bin/sh


browserify  -r web3 -r bs58 -r multihashes  -r ./src/etherid.js:etherid   > dist/etherid.js

browserify  -r web3 -r bs58 -r multihashes  -r ./src/etherid.js:etherid  | uglifyjs > dist/etherid.min.js
