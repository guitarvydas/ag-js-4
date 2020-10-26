function TimeoutTimer (id, name) {
    this.parent = null;
    this.id = id;
    if (name) { this.name = name } else { this.name = "TimeoutTimer" };
    this.isSchematic = false;
    this.inputQueue = [];
    this.isReady = function () { return ( this.inputQueue.length > 0 ); };
    this.hasInputs = function () {
	return (0 < this.inputQueue.length);
    };
    this.consumeOneEventIfReady = function () {
	if (this.isReady()) {
	    var event = this.inputQueue.pop ();
	    this.react (event);
	}
    };

    /* 
       transition[0] == start ball to IDLE (default entry)
       transition[1] == IDLE to TIMING on "start"
       transition[2] == TIMING to IDLE on "stop"
       transition[3] == TIMING to IDLE on "timeout"
       transition[4] == TIMING to TIMING on "start"
       transition[5] == IDLE to IDLE on "stop"
    */

    this.transitionArray = [
	/* 0 */ () => { this.state = "IDLE"; },
	/* 1 */ () => { this.time = this.event.data; this.state = "TIMING"; },
        /* 2 */ () => { this.killTimer (); this.state = "IDLE";},
	/* 3 */ () => { kernel.send(this, {pin: "timeout", data: true}); this.state = "IDLE";},
	/* 4 */ () => { this.killTimer (); this.state = "TIMING"; },
	/* 5 */ () => { this.state = "IDLE"; },
    ];

    this.exitCollection = [];

    this.entryCollection = [
	{ state : "IDLE", func: () => { kernel.send (this, {pin: "sync", data: true}); this.state = "IDLE"; }},
	{ state : "TIMING", func: () => { this.startTimer (); this.state = "TIMING"; }}
    ];

    this.lookupAndCall = function (stateName, collection) {
	for (var i = 0 ; i < collection.length ; i += 1) {
	    if (stateName == collection[i].state) {
		return collection[i].func();
	    }
	}
    };

    this.transitionFunction = (n) => {
	this.lookupAndCall(this.state, this.exitCollection);
	this.transitionArray[n] && this.transitionArray[n](); 
	this.lookupAndCall(this.state, this.entryCollection);
    };

    this.react = function (AGevent) {
	kernel.debug (this, AGevent);
	this.event = AGevent;
	if (this.state == "IDLE") {
	    if (AGevent.pin == "start") {
		this.transitionFunction (1);
	    } else if (AGevent.pin == "stop") {
		this.transitionFunction (5);
	    } else {
		throw "INTERNAL ERROR";
	    };
	} else if (this.state == "TIMING") {
	    if (AGevent.pin == "stop") {
		this.transitionFunction (2);
	    } else if (AGevent.pin == "timeout") {
		this.transitionFunction (3);
	    } else if (AGevent.pin == "start") {
		this.transitionFunction (4);
	    } else {
		throw "INTERNAL ERROR";
	    };
	} else if (this.state == "-no-state-") {
	} else {
	    throw "INTERNAL ERROR";
	};
	this.event = null;
    };
    
    this.sendTimeout = () => { kernel.send (this, {pin: "timeout", data: true})};
    this.sendSync = () => { console.log("...send timer sync"); kernel.send (this, {pin: "sync", data: true}) };
    this.killTimer = () => { clearTimeout(this.var_timeout); };
    this.startTimer = () => { 
	this.var_timeout = setTimeout(
	    () => {
		this.react ({pin: "timeout", data: true});
		kernel.io ();
	    },
	    this.time);
    };

    this.state = "-no-state-";
    this.transitionFunction (0); /* take default transition */
    
};
