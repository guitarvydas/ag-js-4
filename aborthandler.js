// inputs: "in"
// output: none

function AbortHandler (id, name) {
    this.parent = null;
    this.id = id;
    if (name) { this.name = name } else { this.name = "ErrorHandler" };
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

    this.react = function (AGevent) {
	kernel.debug (this, AGevent);
	if ("in" == AGevent.pin) {
	    var data = AGevent.data;
	    document.getElementById(id).innerHTML =
		"<BR>ABORT<BR>" + data;
	}
    }; // default

};
