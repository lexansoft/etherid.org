contract EtherId {

uint constant MAX_PROLONG = 2000000;

uint public n_domains = 0;
uint public root_domain = 0;

struct Id {
    uint value;
    uint next_id;
    uint prev_id;
}

struct Domain {
    address owner;
    uint expires;
    uint price;
    address transfer;
    uint next_domain;
    uint root_id;
    mapping (uint => Id) ids;
}

mapping (uint => Domain) domains;

function EtherId()
{

}

event DomainChanged( address indexed sender, uint domain, uint id );

function getId( uint domain, uint id ) constant returns (uint v, uint next_id, uint prev_id )
{
  v = domains[domain].ids[id].value;
  next_id = domains[domain].ids[id].next_id;
  prev_id = domains[domain].ids[id].prev_id;
}

function getDomain( uint domain ) constant returns 
    (address owner, uint expires, uint price, address transfer, uint next_domain, uint root_id )
{
    Domain d;
    d = domains[ domain ];
    
    owner = d.owner;
    expires = d.expires;
    price = d.price;
    transfer = d.transfer;
    next_domain = d.next_domain;
    root_id = d.root_id;    
}


function changeDomain( uint domain, uint expires, uint price, address transfer ) 
{
    Domain d;

    if( expires > MAX_PROLONG ) 
    {
        expires = MAX_PROLONG;
    }

    d = domains[ domain ];

    if( d.owner == 0 ) 
    { //does not exists yet
        d.owner = msg.sender;
        d.price = price;
        d.transfer = transfer;
        d.expires = block.number + expires;
        d.next_domain = root_domain;
        root_domain = domain;
        n_domains = n_domains + 1;
        DomainChanged( msg.sender, domain, 0 );
    }
    else
    {
        if( d.owner == msg.sender || block.number > d.expires ) {
            d.owner = msg.sender;
            d.price = price;
            d.transfer = transfer;
            d.expires = block.number + expires;
            DomainChanged( msg.sender, domain, 0 );
        }
        else
        {
            if( d.transfer != 0 ) {
                if( d.transfer == msg.sender && msg.value >= d.price ) 
                {
                    if( msg.value > 0 ) 
                    { 
                        d.owner.send( msg.value );
                    }

                    d.owner = msg.sender;
                    d.price = price;
                    d.transfer = transfer;
                    d.expires = block.number + expires;
                    DomainChanged( msg.sender, domain, 0 );
                }
            } 
            else
            {
                if( d.price > 0 &&  msg.value >= d.price ) 
                {
                    if( msg.value > 0 ) 
                    { 
                        address( d.owner ).send( msg.value );
                    }

                    d.owner = msg.sender;
                    d.price = price;
                    d.transfer = transfer;
                    d.expires = block.number + expires;
                    DomainChanged( msg.sender, domain, 0 );
                }
            }
        }
    }
}

function changeId( uint domain, uint name, uint value ) {

    Domain d;
    d = domains[ domain ];

    if( d.owner == msg.sender ) 
    {
        Id id;
        id = d.ids[ name ];

        if( id.value == 0 ) {
            if( value != 0 ) {
                id.value = value;
                id.next_id = d.root_id;
                // id.prev_id = 0;
                
                if( d.root_id != 0 ) 
                {
                    d.ids[ d.root_id ].prev_id = name;
                }

                d.root_id = name;
                DomainChanged( msg.sender, domain, name );
            }
        }
        else
        {
            if( value != 0 )
            {
                id.value = value;
            }
            else //delete the id
            {
                if( id.prev_id != 0 )
                {
                    d.ids[ id.prev_id ].next_id = id.next_id;   
                }
                else
                {
                    d.root_id = id.next_id;
                }

                if( id.next_id != 0 )
                {
                    d.ids[ id.next_id ].prev_id = id.prev_id;   
                }
                
                id.prev_id = 0;   
                id.next_id = 0;   
                id.value = 0;   
                DomainChanged( msg.sender, domain, name );
            }
        }
    }
}

}