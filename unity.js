// usage:
// npm install ohm-js
// npm install minimist
// node unity.js --input=top.html


const ohmQuote = '"' + "\\" + '"' + '"';

const fs = require ('fs')
const ohm = require ('ohm-js')

const unityGrammar = `
HTMLUnity {
    HTML = htmlElement headerStuff bodyElement BodyStuff bodyElementEnd htmlEnd
    htmlElement = "<html>" spaces
    headerStuff = notBody*
    bodyElement = "<body>" spaces
    BodyStuff = bodyStuff
    bodyStuff = notBodyEnd*	
    notBody = ~"<body>" any
    notBodyEnd = ~"</body>" any
    bodyElementEnd = "</body>" spaces
    htmlEnd = "</html>" spaces
}
`;

const uGrammar = ohm.grammar (unityGrammar);
var args = require('minimist') (process.argv.slice (2));
var inputFilename = args['input'];
const input = fs.readFileSync("./" + inputFilename);
const unityParseTree = uGrammar.match (input);

function toPackedString (a) {
    return a.join ('');
}

if (unityParseTree.failed ()) {

    console.log ("Matching Failed")
    console.log (uGrammar.trace (input).toString ());

} else {
    console.log ("Matching Succeeded")
    const semantics = uGrammar.createSemantics ()
    semantics.addOperation (
	'unity',
	{
	    HTML: function (htmlElement, headerStuff, bodyElement, bodyStuff, bodyElementEnd, htmlEnd) {
		return htmlElement.unity () + headerStuff.unity () + bodyElement.unity () + bodyStuff.unity () + bodyElementEnd.unity () + htmlEnd.unity (); 
	    },
	    htmlElement: function (html, spaces) { return "<html>" + spaces.unity ().join (''); },
	    headerStuff: function (stuff) { return stuff.unity ().join (''); },
	    bodyElement: function (body, spaces) { return "<body>" + spaces.unity ().join ('')},
	    BodyStuff: function (stuff) { return stuff.unity (); },
	    bodyStuff: function (stuff) { return stuff.unity ().join (''); },
	    notBody:function (c) { return c.unity (); },
	    notBodyEnd: function (c) { return c.unity (); },
	    bodyElementEnd: function (body, spaces) { return "</body>" + spaces.unity ().join ('');},
	    htmlEnd: function (html, spaces) { return "</html>" + spaces.unity ().join ('');},

	    _terminal: function () { return this.primitiveValue; }
	});
    
    console.log (semantics (unityParseTree).unity ());
}

	






	
