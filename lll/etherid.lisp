;
; EtherId contract
;
; Written by Alexandre Naverniouk
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
    (def "T_TRANSFER"   0x4 )
    (def "T_ID_DOMAIN"  0x5 )
    (def "T_ID_ID"      0x6 )
    (def "T_ID_VALUE"   0x7 )


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

    ; local variables
    (def "tx_value_used" 0x0 )
    (def "i" 0x20 )
    (def "found" 0x40 )
    (def "is_admin" 0x60 )
    (def "ptr" 0x80 )
    (def "n" 0x100 )
    (def "can_change" 0x120 )
    (def "unused_record" 0x140 )
    (def "is_admin" 0x160 )
                     
( return 0 ( lll {

    [ tx_value_used ] 0             
    [ is_admin ] (= (caller) @@owner) 
                     
    ( when (= txCommand "domain")  
    {     
        (def "txDomain"     (calldataload 0x20) )
        (def "txProlong"    (calldataload 0x40) )
        (def "txPrice"      (calldataload 0x60) )
        (def "txTransfer"   (calldataload 0x80) )

        [ found ] 0
        [ ptr ] table_offset 
        (for [i] : 0  (&& (< @i @@n_domains) (= @found 0 ) )  [i] (+ @i 1) 
        {
            (when (= txDomain @@ @ptr) { ; the domain found

                [ found ] 1

                (when 
                    (|| 
                        (= @@ (+ @ptr T_OWNER ) ( caller ) )        ; is mine
                        (||
                            (> (NUMBER) @@ (+ @ptr T_EXPIRE ) )     ; expired
                            (&&
                                (&&
                                    (> @@ (+ @ptr T_PRICE ) 0 )             ; price > 0  
                                    (> ( callvalue ) @@ (+ @ptr T_PRICE ) ) ; has enough money 
                                )
                                (|| 
                                    (= @@ (+ @ptr T_TRANSFER ) 0 )          ; no transfer address
                                    (= @@ (+ @ptr T_TRANSFER ) ( caller ) ) ; transfer receiver called
                                )
                             )
                         )
                    )
                {
                    (if
                        
                        (!= @@ (+ @ptr T_OWNER ) ( caller ) )       ; transfering to the new owner
                    {
                        (when (<= (NUMBER) @@ (+ @ptr T_EXPIRE ) )  { ; only pay if not expired
                            (send 0x303 @@ (+ @ptr T_OWNER ) @@ (+ @ptr T_PRICE ) ) ; transfer needed money
                            [ tx_value_used ] @@ (+ @ptr T_PRICE )      ; remember how much used
                        })
                        [[ (+ @ptr T_OWNER) ]] ( caller )           ; put new owner
                        [[ (+ @ptr T_PRICE) ]] 0                    ; reset price
                        [[ (+ @ptr T_TRANSFER) ]] 0                 ; reset transfer address
                    } ; else
                    {
                        [[ (+ @ptr T_PRICE) ]] txPrice              ; set new price
                        [[ (+ @ptr T_TRANSFER) ]] txTransfer        ; set new transfer address
                    })
                 
                    [ n ] txProlong  ; prolong time in blocks           
                    (when (> @n MAX_PROLONG ) { 
                        [ n ] MAX_PROLONG   
                    })
                    [[ (+ @ptr T_EXPIRES) ]] (+ ( NUMBER ) @n )     ; set expiration to current block + n
                })
            })

            [ ptr ] (+ @ptr 8 )
        })        
        
        (when (= @found 0) ; not found in the table
        {
            (when (!= txParam1 0 ) { ; 0 not allowed as DOMAIN name
                [[ (+ @ptr T_DOMAIN) ]] txDomain
                [[ (+ @ptr T_OWNER) ]]  ( caller )
                [[ (+ @ptr T_PRICE) ]] txPrice
                [[ (+ @ptr T_TRANSFER) ]] txTransfer        ; set new transfer address
                    
                [ n ] txProlong  ; prolong time in blocks           
                (when (> @n MAX_PROLONG ) { 
                    [ n ] MAX_PROLONG   
                })
                [[ (+ @ptr T_EXPIRES) ]] (+ ( NUMBER ) @n )         ; set expiration to current block + n

                [[ n_domains ]] (+ @@n_domains 1 )
            })
        })

    })

    ( when (= txCommand "id")  
    {     
        (def "txIdDomain"     (calldataload 0x20) )
        (def "txIdId"         (calldataload 0x40) )
        (def "txIdValue"      (calldataload 0x60) ) ; 0 value deltes the id

        ; first find the domain
        [ found ] 0
        [ can_change ] 0
        [ ptr ] table_offset 
        (for [i] : 0  (&& (< @i @@n_domains) (= @found 0 ) )  [i] (+ @i 1) 
        {
            (when (= txIdDomain @@ @ptr) { ; the domain found

                [ found ] 1

                (when 
                    (|| 
                        (= @@ (+ @ptr T_OWNER ) ( caller ) )        ; is mine
                        (< ( NUMBER )  @@ (+ @ptr T_EXPIRES ) )      ; not yet expired
                    )
                {
                     [ can_change ] 1
                })
            })

            [ ptr ] (+ @ptr 8 )
        })        
        
        (when (= @can_change 1) 
        {
            [ found ] 0
            [ unused_record ] 0

            (for [i] : 0  (&& (< @i @@n_ids) (= @found 0 ) )  [i] (+ @i 1) 
            {
                (when (&& (= @unused_record 0 ) (= @@ (+ @ptr T_ID_DOMAIN) 0 ) ) 
                {
                    [ unused_record ] @ptr ; remember for reuse
                })

                (when 
                    (&&
                        (= txIdDomain @@ (+ @ptr T_ID_DOMAIN) ) 
                        (= txIdId @@ (+ @ptr T_ID_ID) ) 
                    )
                {
                    [ found ] 1

                    (when (= txIdValue 0 ) ; remove the id
                    {
                        [[ (+ @ptr T_ID_DOMAIN) ]] 0
                        [[ (+ @ptr T_ID_ID) ]]  0
                    })

                    [[ (+ @ptr T_VALUE) ]] txIdValue
                })

                

            })

            (when (= @found 0 ) {
                
                (when (!= @unused_record 0 )
                {
                    [ ptr ] @unused_record 
                })
                
                
                (when (&& (!= txIdId 0 ) (!= txIdValue 0 ) ) 
                { 
                    [[ (+ @ptr T_ID_DOMAIN ) ]]  txIdDomain
                    [[ (+ @ptr T_ID_ID ) ]]      txIdId
                    [[ (+ @ptr T_ID_VALUE ) ]]   txIdValue

                    [[ n_ids ]] (+ @@n_ids 1 )
                })
            })

        })

    })

    ( when (&& @is_admin (= txCommand "kill") ) {
            (suicide @@owner)
    })

    ( when (> ( callvalue ) @tx_value_used ) { ; return the left over money
        (send 0x303 ( caller ) (- ( callvalue ) @tx_value_used ) )
    });

    } 0)) 
}

