ETHERID_CONTRACT = "0xe54940974aee76fadda804b5a50cca3ec5494455"

domains = new Array()
ids = new Array()
current_domain = {}

web3 = require('web3');

ETH1 = new BigNumber( 1000000000000000000 );    
ETH_SIGN = "\u{1D763}"


$().ready( function(e){ 
    $( "#tabs" ).tabs(
        {
            beforeActivate: function( event, ui ) 
            {
                if( ui.newPanel[0].id != "tabs-info" ) 
                {
                    if( domains.length == 0 ) refresh_lists();
                }
            }    

        }
    );    
    
    
    $("input#search_domain").keyup(function( event ) {
        if( event.keyCode == 13 ) $("#btn_search_domain").click()
    });
    
    
    $("#btn_search_domain").click( function() {
        s = $("input#search_domain").val()
        hex = ""
        ascii = ""

        if( s.substring( 0, 2 ) === "0x" ) 
        {    
            a = hexToArray( s )
            hex = arrayToHex( a )    
            hex = "0x" + hex.substr( 0, 64 )
            ascii = utf8.decode( toAscii( hex ) ) 
        }
        else
        {
            utf = utf8.encode( s ).slice(0, 32);
            hex = "0x" + asciiToHex( utf )    
            ascii = utf8.decode( utf ) 
        }
        
        domain = { "domain": hex }

        for( var i; i < domains.length; i++ ) {
            if( areHexEq( domains[i].domain, hex ) ) {
               domain = domains[i]
               break
            }
        }
        
        updateDomainPage( domain )
        
        
        $("#domain_hex").text( hex );
        $("#domain_ascii").text( ascii );

    })
    
    $("#btn_act_claim").click( function() {
        openActionPan( "claim"); 
        
        my_accounts = web3.eth.accounts;      
        
        $("#act_claim_my_address").empty();
        
        for( var i = 0; i < my_accounts.length; i++ )
        $("#act_claim_my_address")
            .append( $("<option>").val( my_accounts[i] ).text( 
                no0x(my_accounts[i]) + 
                " (" + formatEther( web3.eth.getBalance( my_accounts[i] ), "ETH" ) + ")"                                            
            ) );        
        
        lua = Cookies.get('etherid_last_used_address'); 
        if( lua ) $("#act_claim_my_address").val( lua )
        
    })
    
    $("#btn_act_cancel").click( function() {
        openActionPan( "home"); 
    })
    
    $("#btn_act_claim_domain").click( function() {
        
        current_domain.expires = $("#action_claim #expires").val()
        
        if( current_domain.expires < 1000 ) current_domain.expires = 1000;
        if( current_domain.expires > 2000000 ) current_domain.expires = 2000000;
        
        
        swal({   
            title: "Are you sure?",   
            text: "You are about to claim the domain (" + current_domain.domain + 
                    " ). Your ownership will expire in " + current_domain.expires + " blocks."  ,   
            type: "warning",   
            showCancelButton: true,   
            confirmButtonText: "Yes, claim!",
            closeOnConfirm: false,    
            },
            function(isConfirm){   
                try 
                {
                    wallet_to_use = $("#act_claim_my_address").val()       
                    
                    Cookies.set('etherid_last_used_address', wallet_to_use ); 
                    
                    web3.setProvider( new web3.providers.HttpProvider( ) );    
                    gp = web3.eth.gasPrice;
                    
                    var params = {
                                gas: 200000,
                                gasPrice : gp,
                                from : wallet_to_use,
                                to: ETHERID_CONTRACT,
                                value: 0,
                                data: makeData( [
                                    "domain",
                                    current_domain.expires,
                                    0,
                                    0 
                                ] )
                            };

                    tx = web3.eth.sendTransaction( params );
                }
                catch( err )
                {
                    swal( "Error", err, "error" )                
                    return;
                }            
                swal("Your claim is complete!", 
                     "Please wait for several minutes while the Ethereum network processes the transaction.", "success");               }
        )
    })
} )

function no0x(a)
{
    if( a.substr( 0, 2 ) == "0x" ) { a = a.substr( 2 ); }
    return a;
}
 

function formatEther( v, t )
{
    n = new BigNumber( v );
    
    if( t == "ETH" )
    {
        //return n.div( ETH1 ).toNumber() + "Ξ"; 
        return ETH_SIGN + n.div( ETH1 ).toNumber(); 
    }

    if( t == "ETH2" )
    {
        //return n.div( ETH1 ).toNumber() + "Ξ"; 
        return ETH_SIGN + n.div( ETH1 ).toFixed( 2 ); 
    }
    
    if( n.e < 3 ) { return n + " wei"; }
    if( n.e < 6 ) { return n.div( new BigNumber( "1000" ) ) + " Kwei"; }
    if( n.e < 9 ) { return n.div( new BigNumber( "1000000" ) ) + " Mwei"; }
    if( n.e < 12 ) { return n.div( new BigNumber( "1000000000" ) ) + " Gwei"; }
    if( n.e < 15 ) { return n.div( new BigNumber( "1000000000000" ) ) + " szabo"; }
    if( n.e < 18 ) { return n.div( new BigNumber( "1000000000000000" ) ) + " finney"; }
    //if( n.e < 21 ) { return n.div( new BigNumber( "1000000000000000000" ) ) + " ether"; }
    return n.div( ETH1 ) + " ether"; 
}

function  openActionPan( pan )
{
    current_pan = $( ".action_pan:visible" ).fadeOut( 200, function() {
        $( "#action_" + pan ).fadeIn( 200 );
    });
    
    
}


function  updateDomainPage( domain )
{
    $("#domain_hex").text( domain.domain );
    $("#domain_ascii").text( ascii = utf8.decode( toAscii( domain.domain ) ) );
    $("#domain_owner").text( domain.owner ? domain.owner : "NOT CLAIMED" );
    $("#domain_expires").text( domain.expires );
    $("#domain_price").text( domain.price ? domain.price : "NOT FOR SALE" );
    $("#domain_transfer").text( domain.transfer );

    
    var my_accounts = []
    var current_block = 0;
    
    try 
    {
        web3.setProvider( new web3.providers.HttpProvider( ) );    
        current_block =  web3.eth.getBlock( "latest" ).number;
        my_accounts = web3.eth.accounts;
    }
    catch( e )
    {
        swal("Web3 Error!", "Cannot connect to the Ethereum network. Please install and run an Ethereum client.", "error")
        return;
    }
    
    // Deturmine the status
    
    var available = domain.owner == undefined || domain.owner == ""
    var on_sale = domain.price == undefined || domain.price == 0
    var expired = domain.expires < current_block
    var mine = false;
    if( !available ) {
        for( var i = 0; i < my_accounts.length; i++ )
        {
            if( areHexEq( my_accounts[i], domain.owner ) ) { mine = true; break; }
        }
    }
    
    var on_sale = domain.price > 0
    var forme = false;
    for( var i = 0; i < my_accounts.length; i++ )
    {
        if( areHexEq( my_accounts[i], domain.transfer ) ) { mine = true; break; }
    }
    
    $('#btn_act_claim').prop('disabled', !( expired || available ) );
    $('#btn_act_buy').prop('disabled', !( !mine && ( on_sale || forme ) ) );
    $('#btn_act_prolong').prop('disabled', !mine );
    $('#btn_act_sell').prop('disabled', !mine );
    $('#btn_act_transfer').prop('disabled', !mine );
    
    
    status = "Unknown"
    
    if( on_sale ) status = "On Sale"
    if( available ) status = "Available"
    if( expired ) status = "Expired"
    if( mine ) status = "My Domain"
    
    
    $('#domain_status').text( status )
    
    current_domain = domain
    
}

function areHexEq( a, b )
{
    if( a == undefined ) return false
    if( b == undefined ) return false
    
    var aa = a;
    if( aa.substr( 0, 2 ) == "0x" ) aa = aa.substr( 2 );
    while( aa.charAt( 0 ) == '0' ) { aa = aa.substr( 1 ); }

    var bb = b;
    if( bb.substr( 0, 2 ) == "0x" ) bb = bb.substr( 2 );
    while( bb.charAt( 0 ) == '0' ) { bb = bb.substr( 1 ); }
    
    return aa == bb;
}
      
    
function toAscii(hex) { //fixed version
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

function refresh_lists()
{
    $( "#stat" ).css('visibility', 'visible');
    
    
    try{
        web3.setProvider( new web3.providers.HttpProvider( ) );    
        gp = web3.eth.gasPrice;
    }
    catch( x ) 
    {
        swal("Web3 Error!", "Cannot connect to the Ethereum network. Please install and run an Ethereum client.", "error")
        return;
    }
    
    var sign = toAscii( web3.eth.getStorageAt( ETHERID_CONTRACT, 0 ) );
        
    if( sign != "EtherId" )
    {
        swal("Web3 Error!", "Wrong EtherId contract signature. Please be sure you are connected to the actual Ethereum network.", "error")
        return;
    }    
    
    n_domains = web3.toDecimal ( web3.eth.getStorageAt( ETHERID_CONTRACT,  2 ) );
    $( "stat_domains" ).text( n_domains );
    
    n_ids = web3.toDecimal ( web3.eth.getStorageAt( ETHERID_CONTRACT,  3 ) );
    $( "stat_ids" ).text( n_ids );
    
    table_offset = 0x100;
    
    domains = new Array()    
    for( var i = 0; i < n_domains; i++ )
    {
        domains.push( 
            { 
                'domain': web3.eth.getStorageAt( ETHERID_CONTRACT,  table_offset + 8 * i ),
                'owner' : web3.eth.getStorageAt( ETHERID_CONTRACT,  table_offset + 8 * i + 1 ),
                'expires': web3.toDecimal( web3.eth.getStorageAt( ETHERID_CONTRACT,  table_offset + 8 * i + 2 ) ),
                'price': new BigNumber( web3.eth.getStorageAt( ETHERID_CONTRACT,  table_offset + 8 * i + 3 ) ),
                'transfer': web3.eth.getStorageAt( ETHERID_CONTRACT,  table_offset + 8 * i + 4 ) 
            }
        )
    }
    
    ids = new Array()    
    for( var i = 0; i < n_ids; i++ )
    {
        domains.push( 
            { 
                'domain': web3.eth.getStorageAt( ETHERID_CONTRACT,  table_offset + 8 * i + 5),
                'id' : new BigNumber( web3.eth.getStorageAt( ETHERID_CONTRACT,  table_offset + 8 * i + 6 ) ),
                'value': new BigNumber( web3.eth.getStorageAt( ETHERID_CONTRACT,  table_offset + 8 * i + 7 ) )
            }
        )
    }
}

function arrayToHex( arr ) {
    var str ='';
    for(var i = 0; i < arr.length ; i++) {
        var n = arr[i] & 0xFF;
        str += (( n < 16) ? "0":"") + n.toString(16);
    }
    return str;
}   

function asciiToHex( arr ) {
    var str ='';
    for(var i = 0; i < arr.length ; i++) {
        var n = arr.charCodeAt(i);
        str += (( n < 16) ? "0":"") + n.toString(16);
    }
    return str;
}   
    

function hexToArray( s )
{
    var r =  [];
    
    if( s.substr( 0, 2 ) == "0x" ) { s = s.substr( 2 ); }
    
    if( s.length & 1 ) s = "0" + s;
    
    for (var i = 0; i < s.length; i += 2) {
        r.push( parseInt( s.substr(i, 2) ,16) );
    }        
    
    return r;
}

function makeData( arr )
{
    var d = "";
    
    for( var i = 0; i < arr.length; i++ )
    {
        var n = arr[i];
        var nv = "";
        
//        log( "### " + n + " type: " + ( typeof n ) + " isBigNumber: " + (n instanceof BigNumber) ); 
        
        
        if( typeof n == "string" ) 
        {
            if( n.length > 32 )
            {
                logError( "makeDir: too long string: " + n );
                return "";
            }
            
            for( var j = 0; j < n.length; j++ )
            {
                var c = n.charCodeAt( j ) & 0xFF;
                nv +=(( c < 16) ? "0":"") + c.toString(16);
            }
            
            while( nv.length < 32 * 2 ) { nv += "00"; }
        }
        
        if( typeof n == "number"  || n instanceof BigNumber )
        {
            nv = web3.toHex( n );
            if( nv.indexOf( '0x' ) == 0 ) nv = nv.substr( 2 );
            if( nv.indexOf( '-0x' ) == 0 ) nv = nv.substr( 3 );
            
            if( nv.length % 2 ) { nv = "0" + nv; }

            if( nv.length > 32 * 2 )
            {
                logError( "makeDir: too big number: " + n );
                return "";
            }
            while( nv.length < 32 * 2 ) { nv = "00" + nv; }
        }
        
        if( typeof n == "object" && n.constructor === int256 )
        {
            nv = n.toHex();
        }
        
        
        if( $.isArray( n ) )
        {
            nv = arrayToHex( n );
            var needed_length = Math.floor( ( nv.length + 63 ) / 64 ) * 64;
            while( nv.length < needed_length ) { nv += "00"; }
        }
        
        if( typeof n == "object" && n.constructor === Int8Array )
        {
            nv = arrayToHex( n );
            var needed_length = Math.floor( ( nv.length + 63 ) / 64 ) * 64;
            while( nv.length < needed_length ) { nv += "00"; }
        }
        
        if( nv.indexOf( '0x' ) == 0 ) nv = nv.substr( 2 );
        if( nv.indexOf( '-0x' ) == 0 ) nv = nv.substr( 3 );
        d += nv;
    }
    
    //return "0x" + d;
    return d;
}

