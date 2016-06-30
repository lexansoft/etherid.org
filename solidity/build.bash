#!/bin/sh
# build the LLL contract

solc --version > solc_version_used.txt
solc --bin --abi -o ~/projects/etherid.org/solidity etherid.sol


