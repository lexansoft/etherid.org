/* EtherID JS API */
/* Written by Alexandre Naverniouk */

module.exports = new function() {
    var HEXRE = /^0x[0-9A-Fa-f]+$/
    var SHA256RE = /^Qm[1-9A-Za-z]{44}$/     
    
    var ETHERID_CONTRACT = "0xd588b586d61c826a0e87919b3d1a239206d58bf2"
    var ETHERID_ABI = 
    [{"constant":true,"inputs":[],"name":"root_domain","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"domain","type":"uint256"}],"name":"getDomain","outputs":[{"name":"owner","type":"address"},{"name":"expires","type":"uint256"},{"name":"price","type":"uint256"},{"name":"transfer","type":"address"},{"name":"next_domain","type":"uint256"},{"name":"root_id","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"n_domains","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"domain","type":"uint256"},{"name":"id","type":"uint256"}],"name":"getId","outputs":[{"name":"v","type":"uint256"},{"name":"next_id","type":"uint256"},{"name":"prev_id","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"domain","type":"uint256"},{"name":"expires","type":"uint256"},{"name":"price","type":"uint256"},{"name":"transfer","type":"address"}],"name":"changeDomain","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"domain","type":"uint256"},{"name":"name","type":"uint256"},{"name":"value","type":"uint256"}],"name":"changeId","outputs":[],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sender","type":"address"},{"indexed":false,"name":"domain","type":"uint256"},{"indexed":false,"name":"id","type":"uint256"}],"name":"DomainChanged","type":"event"}]
    ;    
    
    var utf8 = require( "utf8" )
    var MH = require('multihashes')
    var bs58 = require( 'bs58')
    
    this.version = "2.0.0"
    
    this.ether_contract = undefined
    
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
        var domain = name;
        
        if( web3._extend.utils.isBigNumber( name ) ) { domain = name }
        else if( HEXRE.test( name ) )  { domain = web3.toBigNumber( name ) }
        else { //string
            utf = utf8.encode( name ).slice(0, 32);
            hex = "0x" + this.asciiToHex( utf )    
            domain = web3.toBigNumber( hex )
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
        var domain = d;
        if( web3._extend.utils.isBigNumber( d ) ) { domain = d }
        else if( HEXRE.test( d ) )  { domain = web3.toBigNumber( d ) }
        else { //string
            utf = utf8.encode( d ).slice(0, 32);
            hex = "0x" + this.asciiToHex( utf )    
            domain = web3.toBigNumber( hex )
        }
        
        var id = i;
        if( web3._extend.utils.isBigNumber( i ) ) { id = i }
        else if( HEXRE.test( i ) )  { id = web3.toBigNumber( i ) }
        else { //string
            utf = utf8.encode( id ).slice(0, 32);
            hex = "0x" + this.asciiToHex( utf )    
            id = web3.toBigNumber( hex )
        }
        
        if( !callback ) { // NOT RECOMMENDED !!!
            res = this.getContract( web3 ).getId( domain, id ) 

            var h =  web3.toHex( res[0] )
            var a = this.hexToArray( h )
            while( a.length < 32 ) { a.splice( 0, 0, 0) } //make it 32 for sure
            var mh =  MH.encode( new Buffer( a ), 18, 32 ) 
            var hash = bs58.encode( mh )        

            var r =  
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
                    var h =  web3.toHex( res[0] ) 
                    var a = EtherId.hexToArray( h )
                    while( a.length < 32 ) { a.splice( 0, 0, 0) } //make it 32 for sure
                    var mh =  MH.encode( new Buffer( a ), 18, 32 ) 
                    var hash = bs58.encode( mh )        

                    var r =  
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

    
    
    this.changeDomain = function( web3, addr, d, expires, price ,transfer, params, callback )
    {
        var domain = d;
        if( web3._extend.utils.isBigNumber( d ) ) { domain = d }
        else if( HEXRE.test( d ) )  { domain = web3.toBigNumber( d ) }
        else { //string
            var utf = utf8.encode( d ).slice(0, 32);
            var hex = "0x" + this.asciiToHex( utf )    
            domain = web3.toBigNumber( hex )
        } 
        
        if( typeof params == "function"){
            callback = params
            params = {}
        }
        
        if( params == undefined ) 
        {
            params = {}
        }
        
        params.from = addr
        params.value = 0
        params.gas = 160000
        
        
        this.getContract( web3 ).changeDomain.sendTransaction( domain, expires, price, transfer, params, callback );    
    }    
    
    this.changeId = function( web3, addr, d, i, v, params, callback ) {
        var domain = d, id, value;
        if( web3._extend.utils.isBigNumber( d ) ) { domain = d }
        else if( HEXRE.test( d ) )  { domain = web3.toBigNumber( d ) }
        else { //string
            var utf = utf8.encode( d ).slice(0, 32);
            var hex = "0x" + this.asciiToHex( utf )    
            domain = web3.toBigNumber( hex )
        }
        
        var id = i;
        if( web3._extend.utils.isBigNumber( i ) ) { id = i }
        else if( HEXRE.test( i ) )  { id = web3.toBigNumber( i ) }
        else { //string
            var utf = utf8.encode( id ).slice(0, 32);
            var hex = "0x" + this.asciiToHex( utf )    
            id = web3.toBigNumber( hex )
        }
        
        var value = ""
        if( web3._extend.utils.isBigNumber( v ) ) { value = v }
        else if( HEXRE.test( v ) )  { value = web3.toBigNumber( v ) }
        else if( SHA256RE.test( v ) ) 
        {
            var out = bs58.decode( v )
            ar = MH.decode( new Buffer( out ) )
            if ( ar.length != 32 ) throw "HASH code should be 32 bytes long"
            if ( ar.code != 0x12 ) throw "Only sha2-256 hashes are excepted"
            var hex =  "0x" + arrayToHex( ar.digest )
            value = web3.toBigNumber( hex ) 
        }
        else
        {
            var utf = utf8.encode( v ).slice(0, 32);
            var hex = "0x" + this.asciiToHex( utf ) 
            value = web3.toBigNumber( hex ) 
        }
        
        if( v == 0 ) throw "Value cannot be zero"

        if( typeof params == "function"){
            callback = params
            params = {}
        }
        
        if( params == undefined ) 
        {
            params = {}
        }
        
        params.from = addr
        params.value = 0
        params.gas = 160000
        
        this.getContract( web3 ).changeId.sendTransaction( domain, id, value, params, callback );     
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
        
        var d = this.getDomain( web3, domain )
        
        var e = 
        {
            domain: d.domain,
            current_id: d.root_id,
            zero_id_passed: false,
            n: 0
        }
        return e
    }    
    
    
    this.getNextId = function( web3, e ) {
        
        var id = this.getId( web3, e.domain, e.current_id ) 
        
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


