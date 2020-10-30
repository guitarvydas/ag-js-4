// usage:
// npm install ohm-js
// npm install minimist
// node unity.js --input=top.html


const ohmQuote = '"' + "\\" + '"' + '"';

const fs = require ('fs')
const ohm = require ('ohm-js')

const unityGrammar = `
htmlUnity {
    html = htmlElement headerStuff bodyElement bodyStuff bodyElementEnd htmlEnd
    htmlElement = "<html>" spaces
    headerStuff = notBody*
    bodyElement = "<body>" spaces
    bodyStuff = notBodyEnd*	
    notBody = ~"<body>" any
    notBodyEnd = ~"</body>" any
    bodyElementEnd = "</body>" spaces
    htmlEnd = "</html>" spaces
}
htmlSVGUnity <: htmlUnity {
    bodyStuff := bodyStuffPre* svgSection bodyStuffPost
    bodyStuffPre = ~svgHeader any
    bodyStuffPost = bodyStuff
    
    svgSection = svgHeader wh ">" spaces (rect | text)+ "</svg>" spaces
  
    rect = "<rect" spaces id xywh ">" spaces "</rect>" spaces
    text = "<text" spaces id xy ">" spaces htmlchar+ "</text>" spaces
    id = "id=" string
    xywh = xy wh
    xy = "x=" numString "y=" numString
    wh = "width=" numString "height=" numString
    htmlchar = ~">" ~"<" any
    numString = ${ohmQuote} digit+ ${ohmQuote} spaces
    string = ${ohmQuote} notDQuote* ${ohmQuote} spaces
    notDQuote = ~${ohmQuote} any

    svgHeader = "<svg" spaces
}
`;

const grammars = ohm.grammars (unityGrammar);
const grammar = grammars["htmlSVGUnity"];
var args = require('minimist') (process.argv.slice (2));
var inputFilename = args['input'];
const input = fs.readFileSync("./" + inputFilename);
const unityParseTree = grammar.match (input);

function toPackedString (a) {
    return a.join ('');
}

////////
// pt trace
// copy/pasted from ohm-js/src/Trace.js
///////
// Return a string representation of the trace.
// Sample:
//     12⋅+⋅2⋅*⋅3 ✓ exp ⇒  "12"
//     12⋅+⋅2⋅*⋅3   ✓ addExp (LR) ⇒  "12"
//     12⋅+⋅2⋅*⋅3       ✗ addExp_plus
// Trace.prototype.toOrg = function () {
//   const sb = new common.StringBuffer();
//   this.walk((node, parent, depth) => {
//     if (!node) {
//       return this.SKIP;
//     }
//     const ctorName = node.expr.constructor.name;
//     // Don't print anything for Alt nodes.
//     if (ctorName === 'Alt') {
//       return; // eslint-disable-line consistent-return
//     }
//     sb.append(getInputExcerpt(node.input, node.pos, 10) + spaces(depth * 2 + 1));
//     sb.append((node.succeeded ? CHECK_MARK : BALLOT_X) + ' ' + node.displayString);
//     if (node.isHeadOfLeftRecursion) {
//       sb.append(' (LR)');
//     }
//     if (node.succeeded) {
//       const contents = asEscapedString(node.source.contents);
//       sb.append(' ' + RIGHTWARDS_DOUBLE_ARROW + '  ');
//       sb.append(typeof contents === 'string' ? '"' + contents + '"' : contents);
//     }
//     sb.append('\n');
//   });
//   return sb.contents();
// };
////////
// end pt trace
///////

if (unityParseTree.failed ()) {
    
    console.log ("Matching Failed")
    var tr = grammar.trace (input);
    console.log (tr.toString ());

} else {
    console.log ("Matching Succeeded")
    const semantics = grammar.createSemantics ()
    semantics.addOperation (
	'unity',
	{
	    html: function (htmlElement, headerStuff, bodyElement, bodyStuff, bodyElementEnd, htmlEnd) {
		return htmlElement.unity () + headerStuff.unity () + bodyElement.unity () + bodyStuff.unity () + bodyElementEnd.unity () + htmlEnd.unity (); 
	    },
	    htmlElement: function (html, spaces) { return "<html>" + spaces.unity ().join (''); },
	    headerStuff: function (stuff) { return stuff.unity ().join (''); },
	    bodyElement: function (body, spaces) { return "<body>" + spaces.unity ().join ('')},
	    bodyStuff: function (stuff) { return stuff.unity ().join (''); },
	    notBody:function (c) { return c.unity (); },
	    notBodyEnd: function (c) { return c.unity (); },
	    bodyElementEnd: function (body, spaces) { return "</body>" + spaces.unity ().join ('');},
	    htmlEnd: function (html, spaces) { return "</html>" + spaces.unity ().join ('');},

	    bodyStuff: function (pres, svg, post) { return pres.unity ().join('') + svg.unity () + post.unity (); },

	    bodyStuffPre: function (c) { return c.unity (); },
	    bodyStuffPost: function (stuff) { return stuff.unity (); },
	    svgSsection: function (svg, wh, _gt, spaces1, elements, endSvg, spaces2) {
		return "<svg" + wh.unity () + ">" + elements.unity ().join ('') + "</svg>";
	    },
	    rect: function (rect, spaces1, _id, xywh, _gt, spaces2, _endRect, spaces3) {},
	    text: function (text, spaces1, _id, xy, _gt, spaces2, cs, _endText, spaces3) {},
	    id: function (ideq, id) {},
	    xywh: function (xy, wh) {},
	    xy: function (xeq, xnum, sp1, yeq, ynum, sp2) {},
	    wh: function (weq, wnum, sp1, heq, hnum, sp2) {},
	    htmlchar: function (c) { return c.unity (); },
	    numString: function (_q1, ds, _q2, spaces) {},
	    string: function (_q1, cs, _q2, spaces) {},
	    notDQuote: function (c) { return c.unity (); },

	    _terminal: function () { return this.primitiveValue; }
	});
    
    console.log (semantics (unityParseTree).unity ());
}

	






	
