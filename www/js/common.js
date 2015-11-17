ETHERID_CONTRACT = "0xe54940974aee76fadda804b5a50cca3ec5494455"

domains = new Array()
ids = new Array()

web3 = require('web3');


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

        if( s.substring( 0, 2 ) == "0x" ) 
        {    
            a = hexToArray( s )
            hex = arrayToHex( a )    
            
            hex = "0x" + hex.substr( 0, 64 )
            ascii = toAscii( hex )
        }
        else
        {
            s = s.substr( 0, 32 )
            ascii = s
            hex = "0x" + asciiToHex( s ) 
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
    
    
    
} )

function  updateDomainPage( domain )
{
    
    $("#domain_hex").text( domain.domain );
    $("#domain_ascii").text( ascii = toAscii( domain.domain ) );
    $("#domain_owner").text( domain.owner ? domain.owner : "NOT CLAIMED" );
    $("#domain_expires").text( domain.expires );
    $("#domain_price").text( domain.price ? domain.price : "NOT FOR SALE" );
    $("#domain_transfer").text( domain.transfer );
    
    
}



function areHexEq( a, b )
{
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


