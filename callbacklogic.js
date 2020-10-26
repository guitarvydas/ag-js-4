// input pins = "file", "timeout"
// output pins = "good", "error" , "abort", "no response", "timer start", "timer stop"

// Interim version! This will be upgraded later!
// This version is already hard-to-read.  Later, we will compile diagrams into this code...

// In this version, the timer code is moved out of CallbackLogic and into a separate part (TimeoutTimer)
//  see discussion in PDF file and drawing.drawio

function CallbackLogic (id, name) {
    this.parent = null;
    this.id = id;
    if (name) { this.name = name } else { this.name = "CallbackLogic" };
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

    this.transitionArray = [
	/* 0 */ () => { this.state = "IDLE"; },
	/* 1 */ () => { this.state = "WAIT FOR START"; },
        /* 2 */ () => { this.saveFile(); this.state = "WAIT FOR ON";},
	/* 3 */ () => { this.sendStopTimer(); this.sendDisplay(); this.state = "IDLE" },
	/* 4 */ () => { this.saveFile(); this.state = "WAIT FOR SYNC"; },
	/* 5 */ () => { this.state = "TIMER SYNC"; },
	/* 6 */ () => { this.sendStopTimer(); this.sendError (); this.state = "IDLE"; },
	/* 7 */ () => { this.sendStopTimer(); this.sendAbort (); this.state = "IDLE"; },
	/* 8 */ () => { this.sendStopTimer(); this.sendTimeout (); this.state = "IDLE"; },
	/* 9 */ () => { this.state = "IDLE"; }
    ];

    this.exitCollection = [];

    this.entryCollection = [
	{ state : "IDLE", func: () => { this.state = "IDLE"; }},
	{ state : "WAIT FOR ON", func: () => { this.setup (); this.state = "WAIT FOR ON"; }}
    ];

    this.react = function (AGevent) {
	kernel.debug (this, AGevent);
	this.event = AGevent;
	if (this.state ==  "IDLE") {
	    if (AGevent.pin == "timer sync") {
		this.transitionFunction (1);
	    } else if (AGevent.pin == "file") {
		this.transitionFunction (4);
	    } else if (AGevent.pin == "timeout") {
		this.transitionFunction (9);
	    } else {
		throw "INTERNAL ERROR";
	    };
	} else if (this.state == "WAIT FOR START") {
	    if (AGevent.pin == "file") {
		this.transitionFunction (2);
	    } else {
		throw "INTERNAL ERROR";
	    };
	} else if (this.state == "WAIT FOR SYNC") {
	    if (AGevent.pin == "file") {
		this.transitionFunction (5);
	    } else {
		throw "INTERNAL ERROR";
	    };
	} else if (this.state == "WAIT FOR ON") {
	    if (AGevent.pin == "onload") {
		this.transitionFunction (3);
		kernel.io ();
	    } else if (AGevent.pin == "onerror") {
		this.transitionFunction (6);
		kernel.io ();
	    } else if (AGevent.pin == "onabort") {
		this.transitionFunction (7);
		kernel.io ();
	    } else if (AGevent.pin == "timeout") {
		this.transitionFunction (8);
	    } else {
		throw "INTERNAL ERROR";
	    };
	} else if (this.state == "-no-state-") {
	} else {
	    throw "INTERNAL ERROR";
	};
	this.event = null;
    };

    this.setup = () => { 
	this.reader = new FileReader();
	this.reader.onload = e => { this.react ({pin: "onload", data: e})};
	this.reader.onerror = e => { this.react ({pin: "onerror", data: reader}); };
	this.reader.onabort = e => { this.react ({pin: "onabort", data: reader}); };
	kernel.send(this, {pin: "timer start", data: 3000});
	this.reader.readAsText (this.filedescriptor);
    };
    this.sendStopTimer = () => { kernel.send (this, {pin: "timer stop", data: true})};
    this.sendDisplay = () => {
	let fname = this.filename;
	kernel.send (this, {pin: "good", 
			    data: {filename: fname,
				   contents: this.reader.result}})};
    this.sendError = () => { kernel.send (this, {pin: "error", data: "ERROR"})};
    this.sendAbort = () => { kernel.send (this, {pin: "abort", data: "ABORT"})};
    this.sendTimeout = () => { kernel.send (this, {pin: "timeout", data: true})};
    this.saveFile = () => { 
	this.filename = this.event.data.name ;
	this.filedescriptor = this.event.data.descriptor ; 
    };


    //////
    // implementation details...
    //////
    this.lookupAndCall = function (stateName, collection) {
	for (var i = 0 ; i < collection.length ; i += 1) {
	    if (stateName == collection[i].state) {
		return collection[i].func();
	    }
	}
    };
    this.exitState = function () { this.lookupAndCall(this.state, this.exitCollection); };
    this.makeTransition = function (n) { this.transitionArray[n] && this.transitionArray[n](); };
    this.enterState = function () { this.lookupAndCall(this.state, this.entryCollection); };

    this.transitionFunction = function (n) {
	this.exitState ();
	this.makeTransition (n);
	this.enterState ();
    };

    //////
    // init
    //////
    this.state = "-no-state-";
    this.transitionFunction (0); /* take default transition */

};

