# etherid.org

Ethereum ID Registrar
====================

There are several Ethereum Name registars proposed/implemented. All of them are not what I expect the proper Name Registrar should be.  

EtherId
=======

EtherID is Ethereum Name Registrar

The main facts about the EtherID:

You can register a Domain name for your Ethereum account for some period of time. The maximum time is 2,000,000 Ehtereum blocks ( about a year ) The domain name is in fact a binary 32 byte value. It can be interpreted as UTF8 encoded string.

This is the solution for the name erosion problem. If you have registered a domain name and then lost the private key, the name will not be lost for everyone forever.

While you own a domain you can prolong the ownership.

If you failed to prolong the ownership and the domain expired, then anyoneone can calim the ownership for it.

You can register as many as you want ID's for your domain (name:value pairs).

If you want to sell your domain, put a price on it. Once the price is set, anyone can pay and take the ownership. No communication with you is needed.

If you want to transfer the domain to someone, you simply specify the new address in the Transfer field. The owner of that address, and only him, can then pay the price and claim the domain.

EtherID allows you to store sha256 multihash values as the ID values. Then you can use the
EtherID/IPFS gateway to get access to the IPFS resources. You can read more [EtherId/IPFS](https://github.com/lexansoft/etherid.org/wiki/ipfs_gateway)

The official NodeJS module to communicate with the EtherID contract is [etherid-js](https://github.com/lexansoft/etherid-js)

EtherId contract address: 0x3589d05a1ec4af9f65b0e5554e645707775ee43c

You need to install one of the official Ethereum clients official Ethereum clients

EtherID is an open source project. The code is available from https://github.com/lexansoft/EtherID.org

### etherid-js
The NodeJS module for reading the EtherID contract is available here:

[etherid-js](https://github.com/lexansoft/etherid-js)



Author: Alexandre Naverniouk


