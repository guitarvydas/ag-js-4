// usage:
// npm install ohm-js
// npm install minimist
// node unity.js --input=top.html


const ohmQuote = '"' + "\\" + '"' + '"';

const fs = require ('fs')
const ohm = require ('ohm-js')

const unityGrammar = `
HTMLUnity {
    html = htmlElement headerStuff bodyElement bodyStuff bodyElementEnd htmlEnd
    htmlElement = "<html>" spaces*
    headerStuff = notBody*
    bodyElement = "<body>" spaces*
    bodyStuff = notBodyEnd*	
    notBody = ~"<body>" any
    notBodyEnd = ~"</body>" any
    bodyElementEnd = "</body>" spaces*
    htmlEnd = "</html>" spaces*
}
`;

const grammar = ohm.grammar(unityGrammar);
var args = require('minimist')(process.argv.slice(2));
var inputFilename = args['input'];
const input = fs.readFileSync("./" + inputFilename);
const parseTree = grammar.match(input);

function toPackedString(a) {
    return a.join('');
}

if (parseTree.failed()) {

    console.log("Matching Failed")
    console.log(grammar.trace(input).toString());

} else {
    console.log("Matching Succeeded")
    const semantics = grammar.createSemantics()
    semantics.addOperation (
	'unity',
	{
	    html: function (htmlElement, headerStuff, bodyElement, bodyStuff, bodyElementEnd, htmlEnd) {
		return htmlElement.unity() + headerStuff.unity() + bodyElement.unity() + bodyStuff.unity() + bodyElementEnd.unity() + htmlEnd.unity(); 
	    },
	    htmlElement: function (html, spaces) { return "<html>" + spaces.unity().join(''); },
	    headerStuff: function (stuff) { return stuff.unity().join(''); },
	    bodyElement: function (body, spaces) { return "<body>" + spaces.unity().join('')},
	    bodyStuff: function (stuff) { return stuff.unity().join(''); },
	    notBody:function (c) { return c.unity(); },
	    notBodyEnd: function (c) { return c.unity(); },
	    bodyElementEnd: function (body, spaces) { return "</body>" + spaces.unity().join('');},
	    htmlEnd: function (html, spaces) { return "</html>" + spaces.unity().join('');},

	    _terminal: function () { return this.primitiveValue; }
	});
    
    console.log(semantics(parseTree).toFB());
}

	






	
