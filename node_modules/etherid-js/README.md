# etherid-js
Javascript API for EtherID


## Installation

### In Node.js through npm

```bash
$ npm install etherid-js
```


### In the Browser through browserify

Same as in Node.js, you just have to [browserify](https://github.com/substack/js-browserify) the code before serving it. 

### In the Browser through `<script>` tag

Make the [etherid.min.js](/dist/etherid.min.js) available through your server and load it using a normal `<script>` tag, then you can require('etherid'). See the [Demo HTML](/tests/test.html)  


##Usage

### Initialization of the Web3

The [Web3](https://github.com/ethereum/web3.js) object is needed. This is the proper way to init it, so it will work in the Mist browser.

```javascript
if(typeof web3 === 'undefined')
{
    Web3 = require('web3');
    web3 = new Web3();            
}

if( web3.currentProvider == null )
    web3.setProvider( new web3.providers.HttpProvider( ) );    
```

### Initialization of the EtherID object 
```javascript
var etherid = require('etherid')
```


### Getting total number of registered domains

```javascript
EID.getNumberOfDomains( web3, function( error, result ) {
    document.getElementById( "n_domains" ).innerHTML = result
})
```
Returns total number of registered domains

### Reading the domain record

To read the domain record you call:

```javascript
etherid.getDomain( web3, {DOMAIN_NAME} )
```
{DOMAIN_NAME} can be a BigNumber, string or hex ( "0xNNNN.." )

The call returns a struct:

```javascript
{
    domain      // Domain name (as BigNumber)
    owner       // Address of the domain owner
    expires     // The Ethereum Blockchin block number of expiration
    price       // Selling Price if any
    transfer    // The address for the domain transer
    next_domain // Next domain name in the linked list
    root_id     // First ID if any
    domainStr   // UTF domain name
    domainHex   // HEX domain name    
}
```
Example:

```javascript
domain = EID.getDomain( web3, "test", function( error, domain ) {
    if( !error ) {
        document.getElementById( "expires" ).innerHTML = domain.expires
        document.getElementById( "owner" ).innerHTML = web3.toHex( domain.owner )
        document.getElementById( "price" ).innerHTML = domain.price
        document.getElementById( "transfer" ).innerHTML = web3.toHex( domain.transfer )
        document.getElementById( "next" ).innerHTML = web3.toHex( domain.next_domain )
        document.getElementById( "root_id" ).innerHTML = web3.toHex( domain.root_id )
    }
});
```

### Reading the domain ID

```javascript
etherid.getId( web3, {DOMAIN_NAME}, {ID} )
```

Both {DOMAIN_NAME} and {ID} can be a BigNumber, string or hex ( "0xNNNN.." )

The call returns a struct:

```javascript
{
    name        // ID Name
    nameStr     // ID UTF name
    nameHex     // ID HEX name
    
    value       // Value
    valueInt    // Value as Number
    valueHex    // Value as HEX
    valueStr    // Value as UTF
            
    next_id     // Next ID in the linked list
    prev_id     // Previous ID in the linked list
}
```
Example:

```javascript
EID.getId( web3, "test", "test_number", function( error, id ) {
    if( !error ) 
        document.getElementById( "test_int" ).innerHTML = id.valueInt
});

EID.getId( web3, "test", "test_text", function( error, id ) {
    if( !error ) document.getElementById( "test_text" ).innerHTML = id.valueStr
});

EID.getId( web3, "test", "test_ipfs", function( error, id ) {
    if( !error ) document.getElementById( "test_ipfs" ).innerHTML = id.valueHash
});
```

### Event handler
You can setup a handler that will be called everytime someone changes a domain.

```javascript
etherid.watch( web3, function( error, result ) {
    document.getElementById( "n_domains" ).innerHTML = EID.getNumberOfDomains( web3 )
}) 
```

### Enumerating domains
You can list all the registered domains by using getDomainEnum and getNextDomain


```javascript
DomainEnumerator = etherid.getDomainEnum( web3 )

d = EID.getNextDomain( web3, DomainEnumerator )

while ( d ) {
    document.getElementById( "list_domains" ).innerHTML = "domain #:" + DomainEnumerator.n + " " + d.domainStr
    d = EID.getNextDomain( web3, DomainEnumerator )
}
```
NOTE: The enumerator properly treats the domain with name 0x0 registered in the system. If you implement the loop yourself, do not forget that first 0x0 domain you get is the real domain, and the second is in fact the end of the list.

### Enumerating ID's
You can list all the domain ID's by using getIdEnum and getNextId


```javascript
IdEnumerator = etherid.getIdEnum( web3, "test" )

id = EID.getNextId( web3, IdEnumerator )

while ( id ) {
    document.getElementById( "list_domains" ).innerHTML = "ID #:" + Id.n + " " + id.nameStr
    id = EID.getNextId( web3, IdEnumerator )
}
```
NOTE: The enumerator properly treats the ID with name 0x0 registered in the system. If you implement the loop yourself, do not forget that first 0x0 ID you get might be the real ID, and the second is in fact the end of the list. You should check if the 0x0 ID has value.


### Changing domain
To cahnge the domain record call:

```javascript
EID.changeDomain( web3, {ADDRESS_TO USE}, {DOMAIN}, {EXPIRATION}, {PRICE}, TRANSFER}, callback )
```


Example:

```javascript
function onProlong()
{
    document.getElementById( "prolong_status" ).innerHTML = "Reading domain..."
    
    
    domain = EID.getDomain( web3, "test", function( error, domain ) {
        if( !error ) {
            document.getElementById( "prolong_status" ).innerHTML = "Channging..."
            EID.changeDomain( web3, domain.owner, "test", 2000000, 0, 0, function( error, domain ) {
                if( !error ) {
                    document.getElementById( "prolong_status" ).innerHTML = "Transaction completed"
                }
                else
                {
                    document.getElementById( "prolong_status" ).innerHTML = error
                }
            });    
        }
        else { document.getElementById( "prolong_status" ).innerHTML = error }
    });    
}
```

### Changing ID
To cahnge the domain ID call:

```javascript
EID.changeId( web3, {ADDRESS_TO USE}, {DOMAIN}, {ID}, {VALUE} callback )
```


Example:

```javascript
function onChangeId()
{
    document.getElementById( "change_id_status" ).innerHTML = "Reading domain..."
    
    
    domain = EID.getDomain( web3, "test", function( error, domain ) {
        if( !error ) {
            document.getElementById( "change_id_status" ).innerHTML = "Channging..."
            EID.changeId( web3, domain.owner, "test", "time", new Date().getTime(), function( error, domain ) {
                if( !error ) {
                    document.getElementById( "change_id_status" ).innerHTML = "Transaction completed"
                }
                else
                {
                    document.getElementById( "change_id_status" ).innerHTML = error
                }
            });    
        }
        else { document.getElementById( "change_id_status" ).innerHTML = error }
    });    
}
```

## License

Apache 2.0


##Author

Alexandre Naverniouk
@alexna
