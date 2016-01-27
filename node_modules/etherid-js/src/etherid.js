/* EtherID JS API */
/* Written by Alexandre Naverniouk */

module.exports = new function() {
    var HEXRE = /^0x[0-9A-Fa-f]+$/
    var ETHERID_CONTRACT = "0x3589d05a1ec4af9f65b0e5554e645707775ee43c"
    var ETHERID_ABI = 
    [{"constant":true,"inputs":[],"name":"root_domain","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"domain","type":"uint256"}],"name":"getDomain","outputs":[{"name":"owner","type":"address"},{"name":"expires","type":"uint256"},{"name":"price","type":"uint256"},{"name":"transfer","type":"address"},{"name":"next_domain","type":"uint256"},{"name":"root_id","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"n_domains","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"domain","type":"uint256"},{"name":"id","type":"uint256"}],"name":"getId","outputs":[{"name":"v","type":"uint256"},{"name":"next_id","type":"uint256"},{"name":"prev_id","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"domain","type":"uint256"},{"name":"expires","type":"uint256"},{"name":"price","type":"uint256"},{"name":"transfer","type":"address"}],"name":"changeDomain","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"domain","type":"uint256"},{"name":"name","type":"uint256"},{"name":"value","type":"uint256"}],"name":"changeId","outputs":[],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sender","type":"address"},{"indexed":false,"name":"domain","type":"uint256"},{"indexed":false,"name":"id","type":"uint256"}],"name":"DomainChanged","type":"event"}]
    ;    
    
    var BigNumber = require( "bignumber.js" )
    var utf8 = require( "utf8" )
    var MH = require('multihashes')
    var bs58 = require( 'bs58')
    
    this.version = "1.1.1"
    
    this.ether_contract = undefined
    
    this.isBigNumber = function (object) {
        return object instanceof BigNumber ||
            (object && object.constructor && object.constructor.name === 'BigNumber');
    };    
    
    
    this.getContract = function ( web3 ){
        if( this.ether_contract ) return this.ether_contract;
        this.ether_contract = web3.eth.contract( ETHERID_ABI).at(ETHERID_CONTRACT);
        return this.ether_contract;
    }    
    
    this.watch = function( web3, func ) {
        this.getContract( web3 ).DomainChanged().watch( func ) // function( error, result )
    }

    this.asciiToHex = function ( arr ) {
        var str ='';
        for(var i = 0; i < arr.length ; i++) {
            var n = arr.charCodeAt(i);
            str += (( n < 16) ? "0":"") + n.toString(16);
        }
        
        if( str == "" ) str = 0
        return str;
    } 
    
    this.getNumberOfDomains = function ( web3, callback ) {
        return this.getContract( web3 ).n_domains( callback )
    }

    
    this.toUTF = function ( web3, v ) {
        try {
            return utf8.decode( this.toAscii( web3.toHex( v ) ) )
        }
        catch( x ) 
        { 
            return ""
        }
    }

    this.getDomain = function ( web3, name, callback ) {
        
        test = web3.toHex( name )
        
        domain = name;
        
        if( this.isBigNumber( name ) ) { domain = name }
        else if( HEXRE.test( name ) )  { domain = new BigNumber( name ) }
        else { //string
            utf = utf8.encode( name ).slice(0, 32);
            hex = "0x" + this.asciiToHex( utf )    
            domain = new BigNumber( hex )
        }
        
        if( !callback ) { // NOT RECOMMENDED !!!
            res = this.getContract( web3 ).getDomain( domain );

            r =  
            {
                domain: domain,
                owner: res[0],
                expires: res[1],
                price: res[2],
                transfer: res[3],
                next_domain: res[4],
                root_id: res[5],

                domainStr: this.toUTF( web3, domain ),
                domainHex: web3.toHex( domain )
            }

            return r;
        } 
        else
        {
            var EtherId = this;
            this.getContract( web3 ).getDomain( domain, function( error, res ) {
                
                if( error ) { callback( error, null ) }
                else {
                    r =  
                    {
                        domain: domain,
                        owner: res[0],
                        expires: res[1],
                        price: res[2],
                        transfer: res[3],
                        next_domain: res[4],
                        root_id: res[5],

                        domainStr: EtherId.toUTF( web3, domain ),
                        domainHex: web3.toHex( domain )
                    }                    
                    callback( null, r )
                }
                
                
            });            
        }
    }

    this.getId = function ( web3, d, i, callback ) {
        domain = d;
        if( this.isBigNumber( d ) ) { domain = d }
        else if( HEXRE.test( d ) )  { domain = new BigNumber( d ) }
        else { //string
            utf = utf8.encode( d ).slice(0, 32);
            hex = "0x" + this.asciiToHex( utf )    
            domain = new BigNumber( hex )
        }
        
        id = i;
        if( this.isBigNumber( i ) ) { id = i }
        else if( HEXRE.test( i ) )  { id = new BigNumber( i ) }
        else { //string
            utf = utf8.encode( id ).slice(0, 32);
            hex = "0x" + this.asciiToHex( utf )    
            id = new BigNumber( hex )
        }
        
        if( !callback ) { // NOT RECOMMENDED !!!
            res = this.getContract( web3 ).getId( domain, id ) 

            h =  web3.toHex( res[0] )
            a = this.hexToArray( h )
            while( a.length < 32 ) { a.splice( 0, 0, 0) } //make it 32 for sure
            mh =  MH.encode( new Buffer( a ), 18, 32 ) 
            hash = bs58.encode( mh )        

            r =  
            {
                name: id,
                nameStr: this.toUTF( web3, id ),
                nameHex: web3.toHex( id ),
                value: res[0],
                valueInt: res[0].toNumber(),
                valueHex: h,
                valueStr: this.toUTF( web3, res[0] ),
                valueHash: hash,
                next_id: res[1],
                prev_id: res[2]
            }

            return r;
        }
        else
        {
            var EtherId = this;
            res = this.getContract( web3 ).getId( domain, id, function( error, res ) {
                if( error ) { callback( error, null ) }
                else {
                    h =  web3.toHex( res[0] ) 
                    a = EtherId.hexToArray( h )
                    while( a.length < 32 ) { a.splice( 0, 0, 0) } //make it 32 for sure
                    mh =  MH.encode( new Buffer( a ), 18, 32 ) 
                    hash = bs58.encode( mh )        

                    r =  
                    {
                        name: id,
                        nameStr: EtherId.toUTF( web3, id ),
                        nameHex: web3.toHex( id ),
                        value: res[0],
                        valueInt: res[0].toNumber(),
                        valueHex: h,
                        valueStr: EtherId.toUTF( web3, res[0] ),
                        valueHash: hash,
                        next_id: res[1],
                        prev_id: res[2]
                    }

                     callback( null, r )
                }                
            })
        }
    }

    this.toAscii = function (hex) { //fixed version
    // Find termination
        var str = "";
        var i = 0, l = hex.length;
        if (hex.substring(0, 2) === '0x') {
            i = 2;
        }
        for (; i < l; i+=2) {
            var code = parseInt(hex.substr(i, 2), 16);
            if( code == 0 ) break;        
            str += String.fromCharCode(code);
        }

        return str;
    };    
    
    this.hexToArray = function ( s )
    {
        var r =  [];

        if( s.substr( 0, 2 ) == "0x" ) { s = s.substr( 2 ); }

        if( s.length & 1 ) s = "0" + s;

        for (var i = 0; i < s.length; i += 2) {
            r.push( parseInt( s.substr(i, 2) ,16) );
        }        

        return r;
    }
    
    this.getDomainEnum = function( web3 )
    {
        e = 
        {
            current_domain: this.getContract( web3 ).root_domain(),
            zero_domain_passed: false,
            n: 0
        }
        return e
    }
    

    this.getNextDomain = function( web3, e ) {
        if( e.zero_domain_passed && e.current_domain.toNumber() == 0 ) return undefined
        
        domain = this.getDomain( web3, e.current_domain )
        
        if( domain.domain.toNumber() == 0 ) e.zero_domain_passed = true;
        
        e.current_domain = domain.next_domain
        e.n++
        
        return domain;
    }

    this.getIdEnum = function( web3, domain )
    {
        
        d = this.getDomain( web3, domain )
        
        e = 
        {
            domain: d.domain,
            current_id: d.root_id,
            zero_id_passed: false,
            n: 0
        }
        return e
    }    
    
    
    this.getNextId = function( web3, e ) {
        
        id = this.getId( web3, e.domain, e.current_id ) 
        
        if( e.current_id.toNumber() == 0 ) 
        {
            if( e.zero_id_passed ) return undefined
            if( id.value.toNumber() == 0 ) return undefined
            e.zero_id_passed = true
        }

        e.current_id = id.next_id
        e.n++
        
        return id
    }    
    
}();


