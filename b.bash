#!/bin/sh
# build the LLL contract


#
#------------ Uglification does not work because of the conflict with web3.BigNumber in mist -------------------
#

#browserify -r multihashes -r Buffer -r bs58 -r utf8 -r web3 -r etherid-js -r bignumber.js -r cookies-js -r progressbar.js -r sweetalert  > tmp.js
#
#uglifyjs tmp.js --keep-fnames > www/js/bundle.js
#
#rm tmp.js

browserify -r multihashes -r Buffer -r bs58 -r utf8 -r web3 -r etherid-js -r bignumber.js -r cookies-js -r progressbar.js -r sweetalert  > www/js/bundle.js
