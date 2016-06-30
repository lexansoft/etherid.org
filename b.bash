#!/bin/sh

browserify -r multihashes -r Buffer -r bs58 -r utf8 -r web3 -r etherid-js -r cookies-js -r progressbar.js -r sweetalert | uglifyjs > www/js/bundle.js

#browserify -r multihashes -r Buffer -r bs58 -r utf8 -r web3 -r etherid-js -r cookies-js -r progressbar.js -r sweetalert  > www/js/bundle.js
