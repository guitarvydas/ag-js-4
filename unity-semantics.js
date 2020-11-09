const grammars = ohm.grammars (unityGrammar);
const grammar = grammars["htmlSVGUnity"];
var args = require('minimist') (process.argv.slice (2));
var inputFilename = args['input'];
const input = fs.readFileSync("./" + inputFilename);
const parseTree = grammar.match (input);

function toPackedString (a) {
    return a.join ('');
}


if (parseTree.failed ()) {
    
    console.log ("Matching Failed")
    var tr = grammar.trace (input);
    console.log (tr.toString ());

} else {
    console.log ("Matching Succeeded")
    const semantics = grammar.createSemantics ()
    semantics.addOperation (
	'unity',
	{
	    html: function (wss, htmlElement, headerStuff, bodyElement, bodyStuff, bodyElementEnd, htmlEnd) {
		return wss.unity ().join ('') + htmlElement.unity () + headerStuff.unity () + bodyElement.unity () + bodyStuff.unity () + bodyElementEnd.unity () + htmlEnd.unity (); 
	    },
	    htmlElement: function (html, wss) { return "<html>" + wss.unity ().join (''); },
	    headerStuff: function (stuff) { return stuff.unity ().join (''); },
	    bodyElement: function (body, wss) { return "<body>" + wss.unity ().join ('')},
	    bodyStuff: function (stuff) { return stuff.unity ().join (''); },
	    notBody:function (c) { return c.unity (); },
	    notBodyEnd: function (c) { return c.unity (); },
	    bodyElementEnd: function (body, wss) { return "</body>" + wss.unity ().join ('');},
	    htmlEnd: function (html, wss) { return "</html>" + wss.unity ().join ('');},

	    bodyStuff: function (pres, svg, post) { return pres.unity ().join('') + svg.unity () + post.unity (); },

	    bodyStuffPre: function (c) { return c.unity (); },
	    bodyStuffPost: function (stuff) { return stuff.unity (); },
	    svgSection: function (svg, wh, _gt, wss1, elements, endSvg, wss2) {
		return svg.unity () + wh.unity () + ">" + wss1.unity ().join ('') + elements.unity ().join ('') + "</svg>" + wss2.unity ().join ('');
	    },
	    rect: function (_rect, wss1, id, xywh, gt, wss2, _endRect, wss3) {
		return "<rect" + wss1.unity ().join('') + id.unity () + xywh.unity () + ">" + wss2.unity ().join ('') + "</rect>" + wss3.unity ().join ('');
	    },
	    text: function (_text, wss1, id, xy, _gt, wss2, cs, _endText, wss3) {
		return "<text" + wss1.unity ().join ('') + id.unity () + xy.unity () + ">" + wss2.unity ().join ('') + "</text>" + wss3.unity ().join ('');
	    },
	    id: function (ideq, id) { return "id=" + id.unity (); },
	    xywh: function (xy, wh) { return xy.unity () + wh.unity (); },
	    xy: function (xeq, xnum, yeq, ynum) {
		return "x=" + xnum.unity () + "y=" + ynum.unity (); 
	    },
	    wh: function (weq, wnum, heq, hnum) {
		return "width=" + wnum.unity () + "height=" + hnum.unity (); 
	    },
	    htmlchar: function (c) { return c.unity (); },
	    numString: function (_q1, ds, _q2, wss) {
		return '"' + ds.unity ().join ('') + '"' + wss.unity ().join ('');
	    },
	    string: function (_q1, cs, _q2, wss) { 
		return '"' + cs.unity ().join ('') + '"' + wss.unity ().join ('');
	    },
	    notDQuote: function (c) { return c.unity (); },

	    svgHeader: function (_svg, wss) {
		return "<svg" + wss.unity ().join ('');
	    },

	    ws: function (c) { 
		return c.unity ();
	    },

	    _terminal: function () { return this.primitiveValue; }
	});
    
    
    console.log (semantics (parseTree).unity ());
}

	

