# etherid.org

Ethereum ID Registar
====================

There are several Ethereum Name registars proposed/implemented. All of them are not what I expect the proper Name Registar should be.  

The proper registar for names (or ID's) should provide:

1. Easy way to register a domain
2. Some solution to the problem of what happens if/when I lost my privat key
3. Ability to register any number of ID's under the domain name
4. Easy and simple procedure to sell the ownership of the DOMAIN to somebody else. 



EtherId
=======

EtherId as a simple Ethereum contract that implements the following solution:

1. You can register a domain by calling the register() contract call. Once you do that you own the full control on the registration record, BUT the ownership will expire after some time. (let's say a year)

2. At any moment while you are still holding the ownership you can prolong the ownersip by a simple call. If you fail to prolong your ownership, the record will go into the expired state, when anybody can call the ownership.
If you lost your private key, after some time the record will be again available for the registration.

3. For you own records you can set a price for which you will to sell the domain.  Once the price is set, anyone can pay the price and aquire the ownership. No communiction with you is needed at all. 





