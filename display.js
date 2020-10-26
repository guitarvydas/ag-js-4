// inputs: "file descriptor"
// output: none

function Display (id, name) {
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

    this.react = function (AGevent) {
	kernel.debug (this, AGevent);
	if ("file descriptor" == AGevent.pin) {
	    var filename = AGevent.data.filename;
	    var contents = AGevent.data.contents;
	    var element = document.getElementById(this.id);
	    console.log ("display " + filename);
	    document.getElementById(this.id).innerHTML =
		"FILE REQUESTED: " + filename +
		"<BR>FILE CONTENTS (example 3):<BR>" + contents;
	}
    }; // default

};
