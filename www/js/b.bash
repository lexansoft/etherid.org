#!/bin/sh
# build the LLL contract

browserify -r multihashes -r Buffer -r bs58 > bundle.js
