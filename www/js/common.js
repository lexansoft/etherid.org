ETHERID_CONTRACT = "0xed476bae62d536e993e30faaaa9482b70ac35449"

domains = new Array()
ids = new Array()


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


function refresh_lists()
{
    $( "#stat" ).css('visibility', 'visible');
    
    
    
    
}

