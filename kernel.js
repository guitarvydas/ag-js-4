function Wire (wobject) {
    this.sender = wobject.sender;
    this.receivers = wobject.receivers;
    this.isNC = wobject.isNC;
    this.senderPin = wobject.senderPin;
    this.lockReceivers = function () { // implement if using multi-tasking or bare-metal
	// disable preemption
	// this.receivers.forEach (lock);
    };
    this.unlockReceivers = function () { // implement if using multi-tasking or bare-metal
	// this.receivers.forEach (unlock);
	// enable preemption
    };
    this.deliver = function (data) {
	if (this.isNC) {
	    console.log("Part " + sender.name + " outputs " + data + " on pin " + senderPin);
	} else {
	    this.lockReceivers ();
	    this.receivers.forEach(
		function (r) {
		    var pin = r.pin;
		    r.part.inputQueue.push ( {pin: pin, data: data} );
		})
	    this.unlockReceivers ();
	}
    };
};

function Kernel () {
    this.topPart = null;
    this.allParts = [];
    this.findWire = function (schematic, senderPart, senderPin) {
	var i;
	for (i = 0; i < schematic.wires.length ; i += 1) {
	    var sender = schematic.wires[i].sender;
	    if (sender.part == senderPart && sender.pin == senderPin) {
		return schematic.wires[i];
	    }
	}
	throw "can't find wire for {" + senderPart.name + ", " + senderPin + "} in " + schematic.name;
    };
    
    // the kernel has two phases 1. INITIALIZING and 2. STEADY_STATE
    this.phase = "INITIALIZING"
    this.deferredEventQueue = [];

    this.send = function (part, outputEvent) {
	if (this.phase != "INITIALIZING") {
	    var outputPin = outputEvent.pin; 
	    var outputData = outputEvent.data;
	    var parentSchematic = part.parent;
	    var outputWire = this.findWire (part.parent, part, outputPin);
	    outputWire.deliver (outputData);
	    // console.log ("sent {" + part.name + ", " + outputPin + "}");
	} else {
	    this.deferredEventQueue.push({part: part, event: outputEvent});
	}
    };
    
    this.io = function () {
	this.dispatch ();
    };
    
    this.dispatch = function () {
	if (this.phase != "INITIALIZING") {
	    while (this.topPart.hasInputs()) {
		this.topPart.consumeOneEventIfReady();
	    }
	}
    };

    this.debug = function (part, event) {
	// if (part.state) {
	//     console.log (part.name + " [" + part.state + "] <-- " + event.pin);
	// } else {
	//     console.log (part.name + " <-- " + event.pin);
	// }
    };

    this.initialize = (topPart) => { 
	this.topPart = topPart; 
	this.phase = "STEADY_STATE";
	// release events that were deferred during initialization
	while (0 < this.deferredEventQueue.length) {
	    var event = this.deferredEventQueue.pop();
	    this.send (event.part, event.event);
	}
	this.io ();
    };
};


