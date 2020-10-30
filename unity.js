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
// toOrg
// copy/pasted from ohm-js/src/Trace.js and common.js
///////
repeatFn = function(fn, n) {
  const arr = [];
  while (n-- > 0) {
    arr.push(fn());
  }
  return arr;
};

repeat = function(x, n) {
  return repeatFn(() => x, n);
};
// --------------------------------------------------------------------
// Private stuff
// --------------------------------------------------------------------
// Unicode characters that are used in the `toString` output.
var BALLOT_X = '\u2717';
var CHECK_MARK = '\u2713';
var DOT_OPERATOR = '\u22C5';
var RIGHTWARDS_DOUBLE_ARROW = '\u21D2';
var SYMBOL_FOR_HORIZONTAL_TABULATION = '\u2409';
var SYMBOL_FOR_LINE_FEED = '\u240A';
var SYMBOL_FOR_CARRIAGE_RETURN = '\u240D';
var Flags = {
    succeeded: 1 << 0,
    isRootNode: 1 << 1,
    isImplicitSpaces: 1 << 2,
    isMemoized: 1 << 3,
    isHeadOfLeftRecursion: 1 << 4,
    terminatesLR: 1 << 5
};
function spaces(n) {
    return repeat(' ', n).join('');
}
function asterisks(n) {
    return repeat('*', n).join('');
}
// Return a string representation of a portion of `input` at offset `pos`.
// The result will contain exactly `len` characters.
function getInputExcerpt(input, pos, len) {
    var excerpt = asEscapedString(input.slice(pos, pos + len));
    // Pad the output if necessary.
    if (excerpt.length < len) {
        return excerpt + repeat(' ', len - excerpt.length).join('');
    }
    return excerpt;
}
function asEscapedString(obj) {
    if (typeof obj === 'string') {
        // Replace non-printable characters with visible symbols.
        return obj
            .replace(/ /g, DOT_OPERATOR)
            .replace(/\t/g, SYMBOL_FOR_HORIZONTAL_TABULATION)
            .replace(/\n/g, SYMBOL_FOR_LINE_FEED)
            .replace(/\r/g, SYMBOL_FOR_CARRIAGE_RETURN);
    }
    return String(obj);
}

// StringBuffer - from common.js

StringBuffer = function() {
  this.strings = [];
};

StringBuffer.prototype.append = function(str) {
  this.strings.push(str);
};

StringBuffer.prototype.contents = function() {
  return this.strings.join('');
};
// Return a string representation of the trace.
// Sample:
//     12⋅+⋅2⋅*⋅3 ✓ exp ⇒  "12"
//     12⋅+⋅2⋅*⋅3   ✓ addExp (LR) ⇒  "12"
//     12⋅+⋅2⋅*⋅3       ✗ addExp_plus
toOrgFunction = function () {
    // same as toString, except we prepend an appropriate number of "*"s to the front of each line
    // save the result in a file with .org extension, then edit it with emacs (it should enter org-mode)
    // org-mode - used TAB key on line with *'s, to expand/contract the line
  const sb = new StringBuffer();
  this.walk((node, parent, depth) => {
    if (!node) {
      return this.SKIP;
    }
    const ctorName = node.expr.constructor.name;
    // Don't print anything for Alt nodes.
    if (ctorName === 'Alt') {
      return; // eslint-disable-line consistent-return
    }
      sb.append(asterisks(depth * 2 + 1) + " " + getInputExcerpt(node.input, node.pos, 10) + spaces(depth * 2 + 1));
    sb.append((node.succeeded ? CHECK_MARK : BALLOT_X) + ' ' + node.displayString);
    if (node.isHeadOfLeftRecursion) {
      sb.append(' (LR)');
    }
    if (node.succeeded) {
      const contents = asEscapedString(node.source.contents);
      sb.append(' ' + RIGHTWARDS_DOUBLE_ARROW + '  ');
      sb.append(typeof contents === 'string' ? '"' + contents + '"' : contents);
    }
    sb.append('\n');
  });
  return sb.contents();
};
////////
// end toOrg
///////

if (unityParseTree.failed ()) {
    
    console.log ("Matching Failed")
    var tr = grammar.trace (input);
    tr.toOrg = toOrgFunction;
    console.log (tr.toOrg ());

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

	






	
