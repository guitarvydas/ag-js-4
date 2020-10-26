// inputs: "in"
// output: none

function ErrorHandler (id, name) {
    this.parent = null;
    this.id = id;
    this.isSchematic = false;
    if (name) { this.name = name } else { this.name = "ErrorHandler" };
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
		"<BR>ERROR<BR>" + data;
	}
    }; // default

};
