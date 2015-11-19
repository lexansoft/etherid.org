  
function int256( data )
{
    this.bytes = new Int8Array( 32 );

    this.isInt256 = function( o )
    {
        var t = typeof o; 
        var c1 = t == "int256";
        var c2 = typeof o == "object" && o.isInt256 != undefined; 
        
        return c1 || c2;
    }

    this.xor = function( data )
    {
        if( !this.isInt256( data ) )
        {
            data = new int256( data );
        }
        
        
        var r = new int256();
        
        for( var i = 0; i < 256; i++ )
        {
            r.bytes[i] = this.bytes[i] ^ data.bytes[i];
        }
        
        return r;
    }
    
    this.toHex = function()
    {
        var s = "";

        for( var i = 0; i < 32; i++ )
        {
            var n = this.bytes[i] & 0xFF;
            s +=(( n < 16) ? "0":"") + n.toString(16);
        }
        return s;            
    }


    //
    // initialization
    //
    
    if( !data ) return;
    
    if( typeof data == "number" || data instanceof BigNumber )
    {
        var bn = new BigNumber( data );

        for( var i = 0; i < 32 && data != 0; i++ )
        {
            this.bytes[ 31 - i] =bn.mod( 256 );
            bn = bn.divToInt( 256 );
        }
    }
    
    if( typeof data == "string" )
    {
        if( data.indexOf( '0x' ) == 0 ) data = data.substr( 2 );
        if( data.indexOf( '-0x' ) == 0 ) data = data.substr( 3 );  
        
        for( var i = 0; i < 32 && data.length != 0; i++ )
        {
            var last2 = data;
            if( data.length > 2 ) { last2 = data.substr( data.length - 2 ); }
            
            this.bytes[ 31 - i] = parseInt( last2, 16 );
            
            if( data.length > 2 ) 
            {
                data = data.substr( 0, data.length - 2 ); 
            }
            else
            {
                data = "";
            }
        }        
    }




};
    
