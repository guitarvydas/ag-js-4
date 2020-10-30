// usage:
// npm install ohm-js
// npm install minimist
// node tofb.js --input=top.html


const ohmQuote = '"' + "\\" + '"' + '"';

const fs = require ('fs')
const ohm = require ('ohm-js')
// const grammarSource = fs.readFileSync('grammar.ohm')
const grammarSource = `
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

SchematicDiagramGrammar {
  SchematicDiagram = Header "<body>" NotSVG+ SVGsection NotBODYend* "</body>" Trailer
  SVGsection = "<svg" WH ">" (Rect | Text)+ "</svg>"
  
  Rect = "<rect" ID XYWH ">" "</rect>"
  Text = "<text" ID XY ">" HTMLchar+ "</text>"
  
  ID = "id=" string
  XYWH = XY WH
  XY = "x=" numString "y=" numString
  WH = "width=" numString "height=" numString
  HTMLchar = ~">" ~"<" any
  NotSVGend = ~"</svg>" any
  NotSVG = ~"<svg" any
  NotBODYend = ~"</body>" any
  numString = ${ohmQuote} digit+ ${ohmQuote}
  string = ${ohmQuote} notDQuote* ${ohmQuote}
  notDQuote = ~${ohmQuote} any
  Header = "<html>" (~"<body>" any)+
  Trailer = "</html>"
}
`;

const grammar = ohm.grammar(grammarSource);
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

    const SchematicDiagram_semantics = grammar.createSemantics()

    SchematicDiagram_semantics.addOperation(
	'toText',
	{
	    SchematicDiagram: function (header, body, stuff1, svg, stuff2, bend, trailer) {},
	    SVGsection: function (_svg, wh, _close, contents, _end) {
		return "<svg " + wh.toText() + ">" + contents.toText().join('') + "</svg>"
	    },
            Rect: function (_begin, idTree, xywhTree, _close, _end) {},
            Text: function (_begin, idTree, xyTree, _close, chars, _end) {},
            ID: function (_id, numstr) {},
            XYWH: function (xy, wh) {},
            XY: function (_x, xstring, _y, ystring) {},
            WH: function (_w, wstring, _h, hstring) {
		return "width=" + wstring.toText() + " height=" + hstring.toText() ;
	    },
            HTMLchar: function (c) { return c.toFB(); },
            NotSVGend: function (c) { return c.toFB(); },
            NotSVG: function (c) { return c.toFB(); },
            NotBODYend: function (c) { return c.toFB(); },

            numString: function (_q1, digits, _q2) { return parseInt (toPackedString(digits.toFB())); },
	    string: function (_q1, cs, _q2) { return cs.toFB().join('');},
	    notDQuote: function (c) { return c.toFB(); },
	    
	    Header: function (html, cs) { return html.toText() + cs.toText().join(''); },
	    Trailer: function (endhtml) {},

	    _terminal: function () { return this.primitiveValue; }

	});

    SchematicDiagram_semantics.addOperation(
	'toFB',
	{
	    SchematicDiagram: function (header, body, stuff1, svg, stuff2, bend, trailer) { 
		return  header.toText() + stuff1.toText() + body.toText() + '\n' + svg.toText() + '\n' + svg.toFB() + '\n' + stuff2.toText() + trailer.toText(); 
	    },
	    SVGsection: function (_svg, wh, _close, contents, _end) {
		//var str = `script>\nconsole.log("begin");\nfunction fact(){};\n${contents.toFB().join('\n')}\n`;
		var scrbegin = `<script type="text/factbase">\nconsole.log("begin");`;
		var scrend = `\n<script>`;
		str = scrbegin + `console.log("end");\n` + contents.toFB().join('\n') + scrend;
		return str;
	    },
            Rect: function (_begin, idTree, xywhTree, _close, _end) { 
		var result =[];
		var id = idTree.toFB ();
		var xywh = xywhTree.toFB ();
		result.push (`fact ("rect_x", "${id}", ${xywh[0]});`);
		result.push (`fact ("rect_y", "${id}", ${xywh[1]});`);
		result.push (`fact ("rect_w", "${id}", ${xywh[2]});`);
		result.push (`fact ("rect_h", "${id}", ${xywh[3]});`);
		return result.join('\n'); 
	    },
            Text: function (_begin, idTree, xyTree, _close, chars, _end) {
		var result =[];
		var id = idTree.toFB ();
		var xy = xyTree.toFB ();
		result.push (`fact ("text_x", "${id}", ${xy[0]});`);
		result.push (`fact ("text_y", "${id}", ${xy[1]});`);
		result.push (`fact ("text_text", "${id}", "${chars.toFB().join('')}");`);
		return result.join('\n'); 
	    },
            ID: function (_id, numstr) { return "id" + numstr.toFB (); },
            XYWH: function (xy, wh) { return xy.toFB().concat (wh.toFB ()); },
            XY: function (_x, xstring, _y, ystring) { return [xstring.toFB (), ystring.toFB ()]; },
            WH: function (_w, wstring, _h, hstring) { return [wstring.toFB (), hstring.toFB ()]; },
            HTMLchar: function (c) { return c.toFB(); },
            NotSVGend: function (c) { return c.toFB(); },
            NotSVG: function (c) { return c.toFB(); },
            NotBODYend: function (c) { return c.toFB(); },

            numString: function (_q1, digits, _q2) { return parseInt (toPackedString(digits.toFB())); },
	    string: function (_q1, cs, _q2) { return cs.toFB().join('');},
	    notDQuote: function (c) { return c.toFB(); },

	    Header: function (html, cs) {},
	    Trailer: function (endhtml) {},

	    _terminal: function() { return this.primitiveValue; }
	});      

    console.log(SchematicDiagram_semantics(parseTree).toFB());
}
