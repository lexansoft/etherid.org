;
; EtherId contract
;

{
    (def "MAX_PROLONG"  2000000 ) ; in blocks

    (def "sign"         0x0 )
    (def "owner"        0x1 )
    (def "n_domains"    0x2 )
    (def "n_ids"        0x3 )
    
    (def "table_offset" 0x100 )

; The structure of the table entry 
    (def "T_DOMAIN"     0x0 )
    (def "T_OWNER"      0x1 )
    (def "T_EXPIRES"    0x2 )
    (def "T_PRICE"      0x3 )
    (def "T_ID_DOMAIN"  0x4 )
    (def "T_ID_ID"      0x5 )
    (def "T_ID_VALUE"   0x6 )


; Initialization
	[[ sign ]]         "EtherId"	 
	[[ owner ]]        (caller) 	    ; Admin
	[[ n_domains ]]    0	            ; Total number of domains
	[[ n_ids ]]        0 		        ; Total number of ID's
	

    (def "txCommand"    (calldataload 0) )
    (def "txParam"      (calldataload 0x20) )
    (def "txParam1"     (calldataload 0x20) )
    (def "txParam2"     (calldataload 0x40) )
    (def "txParam3"     (calldataload 0x60) )
    (def "txParam4"     (calldataload 0x80) )

    
    ; parameters for domain()    
    (def "txDomain"     (calldataload 0x20) )
    (def "txProlong"    (calldataload 0x40) )
    (def "txPrice"      (calldataload 0x60) )

    ; parameters for d()    
    (def "txDomain"     (calldataload 0x20) )
    (def "txId"         (calldataload 0x40) )
    (def "txValue"      (calldataload 0x60) ) ; 0 value deltes the id

( return 0 ( lll {

    ; local variables
    (def "tx_value_used" 0x0 )
    (def "i" 0x20 )
    (def "found" 0x40 )
    (def "is_admin" 0x60 )
    (def "ptr" 0x80 )
    (def "n" 0x100 )
                     
    [ tx_value_used ] 0             
    [ is_admin ] (= (caller) @@owner) 
                     
    ( when (= txCommand "domain")  
    {     
        [ found ] 0
        [ ptr ] table_offset 
        (for [i] : 0  (< @i @@n_domains) [i] (+ @i 1) 
        {
            (if (= txDomain @@ @ptr) { ; the domain found

                [ found ] 1

                (if 
                    (|| 
                        (= @@ (+ @ptr T_OWNER ) ( caller ) )        ; is mine
                        (> ( callvalue ) >= ) @@ (+ @ptr T_PRICE )  ; has enough money 
                    )
                {
                    (if (!= @@ (+ @ptr T_OWNER ) ( caller ) )       ; transfering to the new owner
                    {
                        (send 0x303 @@ (+ @ptr T_OWNER ) @@ (+ @ptr T_PRICE ) ) ; transfer needed money
                        [ tx_value_used ] @@ (+ @ptr T_PRICE )      ; remember how much used
                        [[ (+ @ptr T_OWNER) ]] ( caller )           ; put new owner
                        [[ (+ @ptr T_PRICE) ]] txPrice              ; set new price
                    })
                 
                    [ n ] txProlong  ; prolong time in blocks           
                    (if (> *n MAX_PROLONG ) { 
                        [ n ] MAX_PROLONG   
                    })
                    [[ (+ @ptr T_EXPIRES) ]] (+ ( NUMBER ) *n )     ; set expiration to current block + n
                })
            })

            [ ptr ] (+ *ptr 7 )
        })        
        
        (if (= *found 0) ; not found in the table
        {
            (if (!= txParam1 0 ) { ; 0 not allowed as DOMAIN name
                [[ (+ @ptr T_DOMAIN) ]] txDomain
                [[ (+ @ptr T_OWNER) ]]  ( caller )
                [[ (+ @ptr T_PRICE) ]] txPrice
                    
                [ n ] txProlong  ; prolong time in blocks           
                (if (> *n MAX_PROLONG ) { 
                    [ n ] MAX_PROLONG   
                })
                [[ (+ @ptr T_EXPIRES) ]] (+ ( NUMBER ) *n )         ; set expiration to current block + n
                
            })
        })

    })

    ( when (&& @is_admin (= txCommand "kill") ) ) {
        (suicide @@owner)
    })

    ( when (> ( callvalue ) @tx_value_used ) { ; return the left over money
        (send 0x303 ( caller ) (- ( callvalue ) @tx_value_used ) )
    });

} 0)) 
}

