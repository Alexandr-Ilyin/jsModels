
var assert = require("assert");
var m = require("../public/jsModels");

test('array spilce trigger onchange event', function() {
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        addressList : m.list(Address)    });
    var p = new Person({addressList : [{street:"MyStreet", house :"H1"}]});

    var log = "";
    p.onChange("addressList", function(){ log+= " addressList changed"});
    p.addressList().splice(0,1);
    assert.equal(log," addressList changed")
});

test('array setter should update items correctly', function() {
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        addressList : m.list(Address)    });
    var p = new Person({addressList : [{street:"MyStreet", house :"H1"}]});
    p.addressList([{street:"MS2",house:"H2"},{street:"MS3",house:"H3"}])
    assert.equal(p.addressList()[0].street(),"MS2");
    assert.equal(p.addressList()[1].street(),"MS3");
});

test('child array should survive setter', function(){
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        addressList : m.list(Address)    });
    var p = new Person({addressList : [{street:"MyStreet", house :"H1"}]});
    var a1 = p.addressList();
    p.addressList([
        {street:"NewStreet1"}
    ]);
    var a2 = p.addressList();
    assert.equal(a1,a2);
});

test('child object should survive setter', function(){
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        address : m.obj(Address)    });
    var p = new Person({address : {street:"MyStreet", house :"H1"}});

    assert.equal(p.address().house(),"H1");
    var a1 = p.address();
    p.address({street:"NewStreet1"});
    var a2 = p.address();
    assert.equal(a1,a2);
});

test('can pass json to object setter.', function(){
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        address : m.obj(Address)    });
    var p = new Person({address : {street:"MyStreet", house :"H1"}});

    assert.equal(p.address().house(),"H1");
    p.address(        {street:"NewStreet1"}    );
    assert.equal(p.address().house(),null);
    assert.equal(p.address().street(),"NewStreet1");
});

test('can pass deep json to object constructor', function(){
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        address : m.obj(Address)    });
    var p = new Person({address : {street:"MyStreet", house :"H1"}});
    assert.equal(p.address().house(),"H1");
});

test('if list passed to setter then onChange triggered', function(){
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        addressList : m.list(Address)    });
    var p = new Person({addressList : [{street:"MyStreet", house :"H1"}]});
    var log = "";
    p.onChange("addressList", function(){ log+= " addressList changed"});

    p.addressList([
        {street:"NewStreet1"},
        {street:"NewStreet2"}
    ]);
    assert.equal(log," addressList changed")
});



test('can pass json to list setter', function(){
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        addressList : m.list(Address)    });
    var p = new Person({addressList : [{street:"MyStreet", house :"H1"}]});
    p.addressList([
        {street:"NewStreet1"},
        {street:"NewStreet2"}
    ]);

    assert.equal(p.addressList()[0].house(),null);
    assert.equal(p.addressList()[1].street(),"NewStreet2");
});

test('can pass json to array constructor', function(){
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        addressList : m.list(Address)    });
    var p = new Person({addressList : [{street:"MyStreet"}]});
    assert.equal(p.addressList()[0].street(),"MyStreet");
});

test('can pass json to constructor', function(){
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var a = new Address({street :"MyStreet"});
    assert.equal(a.street(),"MyStreet");
});

test('shift object should update positions.', function() {
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        addressList : m.list(Address)    });
    var p = new Person();
    var addressList = p.addressList();
    var a1 = new Address();
    var a2 = new Address();
    var a3 = new Address();
    var a4 = new Address();
    addressList.push(a1);
    addressList.push(a2);
    addressList.push(a3);
    addressList.push(a4);
    var log = "";
    a3.onChanged(function(){ log+= " address #3 changed"});

    m.begin();
    var a1_pop = addressList.shift();
    assert.equal(a1_pop, a1);
    a3.street("S3");
    m.end();
    assert.equal(log, " address #3 changed");
});


test('arrays should trigger onchange.', function() {
    var House = m.define({         num : m.field()     });
    var Address = m.define({         street : m.field(),         house : m.obj(House)     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        addressList : m.list(Address)    });
    var p = new Person();
    var addressList = p.addressList();
    var a1 = new Address();
    addressList.push(a1);

    var log = "";
    addressList.onChange(function(){ log+= " addressList changed"});
    a1.house().num("S3");
    assert.equal(log, " addressList changed");
});

test('nested items should trigger onchange.', function() {
    var House = m.define({         num : m.field()     });
    var Address = m.define({         street : m.field(),         house : m.obj(House)     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        addressList : m.list(Address)    });
    var p = new Person();
    var addressList = p.addressList();
    var a1 = new Address();
    addressList.push(a1);

    var log = "";
    p.onChange(function(){ log+= " person changed"});
    a1.house().num("S3");
    assert.equal(log, " person changed");
});

test('child items should trigger onchange.', function() {
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        addressList : m.list(Address)    });
    var p = new Person();
    var addressList = p.addressList();
    var a1 = new Address();
    addressList.push(a1);

    var log = "";
    p.onChange(function(){ log+= " person changed"});
    a1.street("S3");
    assert.equal(log, " person changed");
});


test('push object should import new object.', function() {
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        addressList : m.list(Address)    });
    var p = new Person();
    var addressList = p.addressList();
    addressList.push(new Address());
    assert.equal(addressList[0].street(), null);
});

test('push json should import new object.', function() {
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        addressList : m.list(Address)    });
    var p = new Person();
    var addressList = p.addressList();
    addressList.push({});
    assert.equal(addressList[0].street(), null);
});
//return;

test('when list defined, default should be empty.', function() {
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        addressList : m.list(Address)    });
    var p = new Person();
    var addressList = p.addressList();
    assert.equal(addressList.length, 0);
});

test('when child changed onChanged should be triggered on child.', function() {
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        address : m.obj(Address)    });
    var p = new Person();

    var log = "";
    p.address().onChanged(function(){ log+="address changed"});
    p.address().street("AAA");
    assert.equal(log, "address changed");
});


test('when child changed onChanged_PROP should be triggered on child.', function() {
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        address : m.obj(Address)    });
    var p = new Person();

    var log = "";
    p.address().onChanged("street", function(){ log+="address changed"});
    p.address().street("AAA");
    assert.equal(log, "address changed");
});

test('when child changed onChanged should be triggered on parent.', function() {
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        address : m.obj(Address)    });
    var p = new Person();

    var log = "";
    p.onChanged("address", function(){ log+="address changed"});
    p.address().street("AAA");
    assert.equal(log, "address changed");

});

test('parent should trigger onChange once if child supports transaction.', function() {
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        address : m.obj(Address)    });
    var p = new Person();
    var log = "";

    p.onChange("address", function(){ log+="address changed"});
    p.address().begin();
    p.address().street("AAA");
    p.address().house("H1");
    p.address().end();
    assert.equal(log, "address changed");

});

test('parent should trigger onChange when child changed.', function() {
    var Address = m.define({         street : m.field(),         house : m.field()     });
    var Person = m.define({         name : m.field(),         lastName : m.field(),        address : m.obj(Address)    });
    var p = new Person();
    var log = "";

    p.onChange("address", function(){ log+="address changed"});
    p.address().street("AAA");
    assert.equal(log, "address changed");

});

test('nested objects should support get', function() {
    var Address = m.define({
        street : m.field(),
        house : m.field()
    });

    var Person = m.define({
        name : m.field(),
        lastName : m.field(),
        address : m.obj(Address)
    });
    var p = new Person();
    p.address().street("AAA");
    assert.equal(p.address().street(), "AAA");

});

test('nested objects should cache in different values.', function() {
    var Address = m.define({
        street : m.field(),
        house : m.field()
    });

    var Person = m.define({
        name : m.field(),
        lastName : m.field(),
        address : m.obj(Address),
        address2 : m.obj(Address)
    });
    var p = new Person();
    assert.equal(p.address(), p.address());
    assert.equal(p.address2(), p.address2());
    assert.notEqual(p.address2(), p.address());
});

test('nested objects should cache.', function() {
    var Address = m.define({
        street : m.field(),
        house : m.field()
    });

    var Person = m.define({
        name : m.field(),
        lastName : m.field(),
        address : m.obj(Address)
    });
    var p = new Person();
    assert.equal(p.address(), p.address());
});

test('onChanged should reset after __t', function() {
    var Person = m.define({
        name : m.field(),
        lastName : m.field()
    });
    var log = "";
    var p = new Person();
    p.onChanged("name", function(v){log+="name-changed-" + v;});
    m.begin();
    p.name("Alex");
    p.name("Peter");
    p.name("Ivan");
    m.end();

    m.begin();
    p.lastName("AAA");
    m.end();

    assert.equal(log,"name-changed-Ivan");
});

test('should trigger onChanged once in __t', function() {
    var Person = m.define({
        name : m.field(),
        lastName : m.field()
    });
    var log = "";
    var p = new Person();
    p.onChanged("name", function(v){log+="name-changed-" + v;});
    m.begin();
    p.name("Alex");
    p.name("Peter");
    p.name("Ivan");
    m.end();
    assert.equal(log,"name-changed-Ivan");
});

test('should not trigger onChange if nothing changed', function(){
    var Person = m.define({
        name : m.field(),
        lastName : m.field()
    });
    var log = "";
    var p = new Person();
    p.name("Alex");
    p.onChange("name", function(v){log+="name-changed;";});
    p.name("Alex");
    assert.equal(log,"");

});

test('should support instance onChange events', function(){
    var Person = m.define({
        name : m.field(),
        lastName : m.field()
    });
    var log = "";
    var p = new Person();
    p.onChange("name", function(v){log+="name-changed;";});
    p.onChange(function(v){log+="changed;";});
    p.name("Alex");
    assert.equal(log,"name-changed;changed;");

    log ="";
    p.lastName("Ilyin");
    assert.equal(log,"changed;");

});

test('should support instance onChange events', function(){
    var Person = m.define({
        name : m.field(),
        lastName : m.field()
    });
    var p = new Person();
    p.onChange("name", function(v){p.lastName(v + "_last")});
    p.name("Alex");
    assert.equal(p.lastName(),"Alex_last");
});

test('should support on change events', function(){
    var Person = m.define({
        name : m.field().onChange(function(v){
            this.lastName(v + "_last");
        }),
        lastName : m.field()
    });
    var p = new Person();
    p.name("Alex");
    assert.equal(p.lastName(),"Alex_last");
});

test('should not crash when model defined', function(){
    m.define({name : m.field()});
});

test('should support getters setter', function(){
    var Person = m.define({name : m.field()});
    var p = new Person();
    p.name("Alex");
    assert.equal(p.name(),"Alex");
});




