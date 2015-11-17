ETHERID_CONTRACT = "0xed476bae62d536e993e30faaaa9482b70ac35449"

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
} )

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
                'domain': new BigNumber( web3.eth.getStorageAt( ETHERID_CONTRACT,  table_offset + 7 * i ) ),
                'owner' : new BigNumber( web3.eth.getStorageAt( ETHERID_CONTRACT,  table_offset + 7 * i + 1 ) ),
                'expires': web3.toDecimal( web3.eth.getStorageAt( ETHERID_CONTRACT,  table_offset + 7 * i + 2 ) ),
                'price': new BigNumber( web3.eth.getStorageAt( ETHERID_CONTRACT,  table_offset + 7 * i + 3 ) )
            }
        )
    }
    
    ids = new Array()    
    for( var i = 0; i < n_ids; i++ )
    {
        domains.push( 
            { 
                'domain': new BigNumber( web3.eth.getStorageAt( ETHERID_CONTRACT,  table_offset + 7 * i + 4) ),
                'id' : new BigNumber( web3.eth.getStorageAt( ETHERID_CONTRACT,  table_offset + 7 * i + 5 ) ),
                'value': new BigNumber( web3.eth.getStorageAt( ETHERID_CONTRACT,  table_offset + 7 * i + 6 ) )
            }
        )
    }
            
}

