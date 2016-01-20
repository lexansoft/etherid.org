#!/bin/sh
# build the LLL contract

browserify -r multihashes -r Buffer -r bs58 -r utf8 > bundle.js
