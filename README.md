# etherid.org

Ethereum ID Registar
====================

There are several Ethereum Name registars proposed/implemented. All of them are not what I expect the proper Name Registar should be.  

The proper registar for names (or ID's) should provide:

1. Easy way to register an ID
2. Some solution to the problem of what happens if/when I lost my privat key
3. Easy and simple procedure to sell the ownership of the ID to somebody else. 


EtherId
=======

EtherId as a simple Ethereum contract that implements the following solution:

1. You can register an ID by calling the register() contract call. Once yuo do that you own the full control on the registration record, BUT the ownership will expire after some time. (let's say a year)

2. At any moment while you are stil holding the ownership you can prolong the ownersip by a simple registr call. If you fail to prolong your ownership, the record will go into the expired state, when anybody esle can call teh ownership.
If you lost your private key, after some time the record will be again available for the registration.

3. For you own records you can set a price for which you will to sell the record.  Once such a price is set, anyone can call trasfer(), pay the price and aquire the ownership. No communiction with you is needed at all. 





