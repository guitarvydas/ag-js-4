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
    
    semantics.addOperation (
	'toFactbase',
	{
	    html: function (wss, htmlElement, headerStuff, bodyElement, bodyStuff, bodyElementEnd, htmlEnd) { throw "INTERNAL ERROR"; },
	    htmlElement: function (html, wss) { throw "INTERNAL ERROR"; },
	    headerStuff: function (stuff) { throw "INTERNAL ERROR"; },
	    bodyElement: function (body, wss) { throw "INTERNAL ERROR"; },
	    bodyStuff: function (stuff) { throw "INTERNAL ERROR"; },
	    notBody:function (c) { throw "INTERNAL ERROR"; },
	    notBodyEnd: function (c) { throw "INTERNAL ERROR"; },
	    bodyElementEnd: function (body, wss) { throw "INTERNAL ERROR"; },
	    htmlEnd: function (html, wss) { throw "INTERNAL ERROR"; },

	    bodyStuff: function (pres, svg, post) { throw "INTERNAL ERROR"; },

	    bodyStuffPre: function (c) { throw "INTERNAL ERROR"; },
	    bodyStuffPost: function (stuff) { throw "INTERNAL ERROR"; },
	    svgSection: function (svg, wh, _gt, wss1, elements, endSvg, wss2) { throw "INTERNAL ERROR"; },

	    // a fact, in general, is a triple { relation, subject, object }
	    // a factbase, in general, is a collection of triples
	    // we create facts by calling the JS "fact" function

	    // rect returns an array[4] of fact strings
	    rect: function (_rect, _wss1, idTree, xywhTree, _gt, _wss2, _endRect, _wss3) {
		var result = [];
		var id = idTree.toFactbase ();
		var xywh = xywhTree.toFactbase ();
		result.push (`fact ("rect_x", ${id}, ${xywh[0]});`);
		result.push (`fact ("rect_y", ${id}, ${xywh[1]});`);
		result.push (`fact ("rect_w", ${id}, ${xywh[2]});`);
		result.push (`fact ("rect_h", ${id}, ${xywh[3]});`);
		return result.join('\n'); 
	    },
	    // text returns an array[3] of fact strings
	    text: function (_text, wss1, idTree, xyTree, _gt, wss2, chars, _endText, wss3) {
		var result =[];
		var id = idTree.toFactbase ();
		var xy = xyTree.toFactbase ();
		result.push (`fact ("text_x", ${id}, ${xy[0]});`);
		result.push (`fact ("text_y", ${id}, ${xy[1]});`);
		result.push (`fact ("text_text", ${id}, "${chars.unity().join('')}");`);
		return result.join('\n'); 
	    },
	    id: function (_ideq, id) { return id.toFactbase (); },
	    xywh: function (xy, wh) { return xy.toFactbase ().concat (wh.toFactbase ()); },
	    xy: function (_xeq, xnum, _yeq, ynum) {
		return [xnum.toFactbase (), ynum.toFactbase ()]; 
	    },
	    wh: function (_weq, wnum, _heq, hnum) {
		return [wnum.toFactbase (), hnum.toFactbase ()]; 
	    },
	    htmlchar: function (c) { return c.toFactbase (); },
	    numString: function (_q1, ds, _q2, _wss) { return parseInt(toPackedString (ds.unity ()));},
	    string: function (_q1, cs, _q2, wss) { 
		return '"' + cs.toFactbase ().join ('') + '"';
	    },
	    notDQuote: function (c) { return c.toFactbase (); },

	    svgHeader: function (_svg, wss) { throw "INTERNAL ERROR"; },

	    ws: function (c) { 
		return c.toFactbase ();
	    },

	    _terminal: function () { return this.primitiveValue; }
	});
    
    semantics.addOperation (
	'addFactbaseToHTML',
	// glue the Factbase (as a <script>) to the raw HTML

	// implementation note: every rule before svgSection calls .addFactbaseToHTML(),
	//   every rule after svgSection can call .unity()
	//   the gluing happens in svgSection, after which it is business as usual (.unity)

	{
	    html: function (wss, htmlElement, headerStuff, bodyElement, bodyStuff, bodyElementEnd, htmlEnd) {
		return wss.addFactbaseToHTML ().join ('') + htmlElement.addFactbaseToHTML () + headerStuff.addFactbaseToHTML () + bodyElement.addFactbaseToHTML () + bodyStuff.addFactbaseToHTML () + bodyElementEnd.addFactbaseToHTML () + htmlEnd.addFactbaseToHTML (); 
	    },
	    htmlElement: function (html, wss) { return "<html>" + wss.addFactbaseToHTML ().join (''); },
	    headerStuff: function (stuff) { return stuff.addFactbaseToHTML ().join (''); },
	    bodyElement: function (body, wss) { return "<body>" + wss.addFactbaseToHTML ().join ('')},
	    bodyStuff: function (stuff) { return stuff.addFactbaseToHTML ().join (''); },
	    notBody:function (c) { return c.unity (); },
	    notBodyEnd: function (c) { return c.unity (); },
	    bodyElementEnd: function (body, wss) { return "</body>" + wss.unity ().join ('');},
	    htmlEnd: function (html, wss) { return "</html>" + wss.unity ().join ('');},

	    bodyStuff: function (pres, svg, post) { return pres.addFactbaseToHTML ().join('') + svg.addFactbaseToHTML () + post.addFactbaseToHTML (); },

	    bodyStuffPre: function (c) { return c.addFactbaseToHTML (); },
	    bodyStuffPost: function (stuff) { return stuff.unity (); },

	    // the switcheroo happens here
	    // emit the raw unity HTML, plus the factbase for the SVG (as a <script> of "fact" calls) 
	    svgSection: function (svg, wh, _gt, wss1, elements, endSvg, wss2) {
		return svg.unity () + wh.unity () + ">" +
		    wss1.unity ().join ('') + elements.unity ().join ("") + "</svg>" +
		    wss2.unity ().join ('') +
		    "<script>\n" +
		    elements.toFactbase ().join("\n") +
		    "\n</script>\n"
		    ;
	    },
	    
	    rect: function (_rect, wss1, id, xywh, gt, wss2, _endRect, wss3) { throw "INTERNAL ERROR"; },
	    text: function (_text, wss1, id, xy, _gt, wss2, cs, _endText, wss3) { throw "INTERNAL ERROR"; },

	    id: function (ideq, id) { return "\"id${id.addFactbaseToHTML ()}\""; },
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
    
    console.log (semantics (parseTree).addFactbaseToHTML ());
}

	






	
