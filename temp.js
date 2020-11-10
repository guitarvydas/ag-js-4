// usage:
// npm install ohm-js
// npm install minimist
// ./run.bash
const fs = require ('fs')
const ohm = require ('ohm-js')

// utility functions for Cons.toString()
function isNil(x) {
    if ("string" == typeof(x)) {
	if ("nil" == x) {
	    return true;
	} else {
	    return false;
	}
    } else {
	return false;
    }
}
function isCons (maybeCell) {
    if ("object" == typeof(maybeCell)) {
	if (maybeCell.isPair) {
	    return true;
	} else {
	    return false;
	}
    } else {
	return false;
    }
}
function carItemToString(x) {
    if (x == undefined) {
	return "error(undefined)";
    } else if (x == null) {
	return "error(null)";
    } else if (isNil(x)) {
	return "nil";
    } else if (isCons(x)) {
	return x.toString();
    } else {
	return x.toString();
    }
}
function cdrItemToString(x) {
    if (x == undefined) {
	return "error(undefined)";
    } else if (x == null) {
	return "error(null)";
    } else if (isNil(x)) {
	return "";
    } else if (isCons(x)) {
	return "";
    } else {
	return x.toString();
    }
}

function toSpacer(x) { // return " . " if cell contains a non-nil/non-next-cell item, return " " if end-of-list, else return ""
    // more edge cases than Lisp or Scheme because of undefined and null, and I've decided to make nil be "nil"
    if (x == undefined) {
	return " ";
    } else if (x == null) {
	return " ";
    } else if ( ("object" == typeof(x) && x.isPair) ) {
	if ( ("object" == typeof(x.cdr)) ) {
	    return " ";
	} else if (isNil(x.cdr)) {
	    return "";
	} else {
	    return " . ";
	}
    } else {
	throw "can't happen";
    }
}

function toTrailingSpace(x) { // return " " if end of list, else ""
    // more edge cases than Lisp or Scheme because of undefined and null, and I've decided to make nil be "nil"
    if (x == undefined) {
	return " ";
    } else if (x == null) {
	return " ";
    } else if ( ("object" == typeof(x) && x.isPair) ) {
	if ( ("object" == typeof(x.cdr)) ) {
	    return " ";
	} else if (isNil(x.cdr)) {
	    return "";
	} else {
	    return "";
	}
    } else {
	throw "can't happen";
    }
}


function continueCDRing(maybeCell) {  // if x.cdr is another Cons, return true, if it's "nil" return false, if it's a primitive return false, else return false
    // more edge cases than Lisp or Scheme because of undefined and null, and I've decided to make nil be "nil"
    // x should be a Cons cell or "nil" or a primitive, but it might be null or undefined (an internal error that I want to see)
    if (maybeCell == undefined) {
	return false;
    } else if (maybeCell == null) {
	return false;
    } else if (isNil(maybeCell)) {
	return false;
    } else if (isCons(maybeCell)) {  // a Cons cell
	let next = cdr(maybeCell);
	if (isCons(next)) {
	    return true;
	} else {
	    return false;
	}
    } else if ("object" == typeof(maybeCell)) {
	return false;
    } else {
	return false;
    }
}
function nextCell(maybeCell) { // return cdr of cell if we are to continue (determined by continueCDRing function, above), else return undefined
    // more edge cases than Lisp or Scheme because of undefined and null, and I've decided to make nil be "nil"
    // x should be a Cons cell or "nil" or a primitive, but it might be null or undefined (an internal error that I want to see)
    if (maybeCell == undefined) {
	return undefined;
    } else if (maybeCell == null) {
	return undefined;
    } else if (isNil(maybeCell)) {
	return undefined;
    } else if (isCons(maybeCell)) {
	return cdr(maybeCell);  // this will return a Cons or might return "nil" if at end of list
    } else if ("object" == typeof(maybeCell)) {
	return undefined;
    } else {
	return undefined;
    }
}
function cellToStr(cell) {
    let str = "(";
    let keepGoing = true;
    while (keepGoing) {
	let a = carItemToString(car(cell));
	let d = cdrItemToString(cdr(cell));
	let spacer = toSpacer(cell);
	let trailer = toTrailingSpace(cell);
	str = str + a + spacer + d + trailer;
	keepGoing = continueCDRing(cell);
	cell = nextCell(cell);
    }
    return str + ")";
}
/////

function Cons(car,cdr) { 
    this.car = car;
    this.cdr = cdr;
    this.isPair = true;
    this.toString = function() {  // returns string (a b) or (a . b) with appropriate trailing space in the possible presence of javascript errors (null and undefined)
	return cellToStr(this);
   }
};

function car(cell) {
    return cell.car;
}
function cdr(cell) {
    return cell.cdr;
}
function cddr(cell) {
    return cdr(cdr(cell));
}
function cdddr(cell) {
    return cdr(cdr(cdr(cell)));
}
function cddddr(cell) {
    return cdr(cdr(cdr(cdr(cell))));
}
function cdddddr(cell) {
    return cdr(cdr(cdr(cdr(cdr(cell)))))
}

function caar (cell) {
    return car(car(cell));
}

function cadr (cell) {
    return car(cdr(cell));
}

function caddr (cell) {
    return car(cddr(cell));
}

function cadddr (cell) {
    return car(cdddr(cell));
}

function caddddr (cell) {
    return car(cddddr(cell));
}

function cadaar (cell) {
    return car(cdr(car(car(cell))));
}

function cons(x,y) {
    if (x == undefined && y == undefined) {
	return "nil";
    } else if (y == undefined) {
	return new Cons(x,"nil");
    } else {
	return new Cons(x,y);
    }
}

function list() {
    var result = "nil";
    for(var i = (arguments.length-1); i >= 0 ; i--) {
	result = cons (arguments[i], result);
    }
    return result;
}
function eq_Q_(x,y) {
    return x === y;
}
function eqv_Q_(x,y) {
    return x === y;
}
function null_Q_(x) {
    if (x == "nil") {
	return true;
    } else if (x.isPair) {
	return false;
    } else {
	return false;
    }
}


function pair_Q_(x) {
    // Scheme doesn't like truthiness or falsiness, it wants true or false
    if (!x) {
	return false;
    } else if (x.isPair) {
	return true;
    } else {
	return false;
    }
}
function toDebug (x) {
    console.log("toDebug x=");
    console.log(x);
    if (x == "nil") {
	return "()";
    } else if (x == null) {
	return "NULL";
    } else if (x == undefined) {
	return "UNDEFINED";
    } else {
	return x.toString();
    }
}
function string_Q_(s) {
    return s && ("string" == typeof(s));
}

function string_EQ_Q_(s1,s2) {
    return s1 == s2;
}

function _plus(a,b){
    return a + b;
}

function set_car_B_(l,v) { l.car = v; }
function newline () { process.stdout.write("\n"); }
function display(x) { 
    if (x == "nil") {
	process.stdout.write("nil");
    } else if (x == undefined) {
	process.stdout.write("undefined");
    } else {
	process.stdout.write(x.toString()); 
    }
}

/////// tests /////
/*
console.log("\ntesting cons...");
let x = cons(1,cons(2,cons(3,cons(4,cons(5,cons(6,"nil"))))));
console.log(x);
console.log(car(x));
console.log(cadr(x));
console.log(caddr(x));
console.log(cadddr(x));
console.log(caddddr(x));
console.log(cdr(cdddddr(x)));

console.log("\ntesting list...");
let y = list(1,2,3,4,5,6);
console.log(y);
console.log(car(y));
console.log(cadr(y));
console.log(caddr(y));
console.log(cadddr(y));
console.log(caddddr(y));
console.log(cdr(cdddddr(y)));

console.log();

console.log("\ntesting eq_Q_...");
console.log(eq_Q_("nil","nil")); // should be true
console.log(eq_Q_(1,1));       // should be true
console.log(eq_Q_(true,true)); // should be true
console.log(eq_Q_(false,false)); // should be true
console.log(eq_Q_("abc","abc")); // should be false in Scheme, but isn't in JS
var s = "abc";
console.log(eq_Q_(s,s));  // should be true
var s2 = "abc";
console.log(eq_Q_(s,s2));  // should be false in Schem, but isn't in JS

console.log(eq_Q_(x,y));  // should be false
console.log(eq_Q_(x,x));  // should be true

console.log();
console.log(typeof(x));

console.log("\ntesting pair_Q_...");
console.log();
var a = "nil";
var b = cons("b",a);
var c = cons("b","nil");
var d = cons();

console.log(a);
console.log(b);
console.log(c);
console.log(d);
console.log(pair_Q_(a));
console.log(pair_Q_(b));
console.log(pair_Q_(c));
console.log(pair_Q_(d));
console.log(pair_Q_("abc"));
console.log(pair_Q_(42));
*/

function testToDebug() {
    console.log("\ntesting toDebug...");
    
    console.log("a");
    let lis = list(1,2,3,list(4,5));
    console.log("b");
    let lis2 = "nil";
    console.log("c");
    console.log(toDebug(null));
    console.log("cc");
    console.log(cons(1,"nil").toString());
    console.log("ccc");
    console.log(list(1).toString());
    console.log("cccc");
    console.log(toDebug(lis));
    console.log("d");
    //console.log(toDebug(lis2));
    console.log("e");
    
    console.log();
    console.log();
}

function testStrings () {
    
    console.log("\ntesting strings...");
    let lll = list("r!","nil");  // should return ("r!" null)
    console.log (lll.toString());
    console.log (car(lll));
    console.log (cadr(lll));  // crashes if lll is not ("r1" null)
}
function testDotted() {
    let ddd = cons(1,2);
    console.log("\ntesting dotted pair");
    console.log(ddd.toString());
    let lll = cons(8,9);
    console.log(lll.toString());
    let cc = list(10);
    console.log(cc.toString());
    let ccc = list(12,13);
    console.log(ccc.toString());
    let lccc = list(14,15,ddd);
    console.log(lccc.toString());
    let cccl = list(list(16,17));
    console.log(cccl.toString());
    let lld = list(cons(18,19));
    console.log(lld.toString());
    let ld = cons(20,cons(21,22));
    console.log(ld.toString());
}

//testToDebug();
//testStrings();
//testDotted();
//    console.log();
//    console.log();
var db = list ();

function clearDB () { db = list (); };
// facts can be pushed in any order (cons results in reverse order)
function pushDB (x) { db = cons (x, db); };
// rules must be kept in order, so we use the less-efficient Append instead of Cons
function appendDB (x) { db = AppendInefficient (db, list(x)); };
function lvar (s) { return list ("?",s); };
function fact0 (r) { pushDB (list (list (r))); }
function fact1 (r,s) { pushDB (list (list (r, car(s)))); }
function fact2 (r,s,o) { pushDB (list (list (r,car(s),car(o)))); }
var fact = fact2;
function rule (head, bod) {
    // make multiple rules, one for each body clause: cons(head,clause)
    // head is a Cons()
    // body is an array of Cons()
    var rle;
    rle = cons (head, bod);
    appendDB (rle);
    return "nil";
};
function lvar (letter) { return list ("?", letter); };
function succeed () { return list (); };
function cut () { return "!"; };
function fail () { return "fail"; };
////
function query (goal) {
    prove6 (list (), goal, db, empty, 1, list (), db);
    var r = get_result ();
    return r;
}

var functor0 = list;
var functor1 = list;
var functor2 = list;
var head = list;
var body = list;
var goal = list;
const ohmQuote = '"' + "\\" + '"' + '"';

const addfbGrammar = `
htmlUnity {
    html = ws* htmlElement headerStuff bodyElement bodyStuff bodyElementEnd htmlEnd
    htmlElement = "<html>" ws*
    headerStuff = notBody*
    bodyElement = "<body>" ws*
    bodyStuff = notBodyEnd*	
    notBody = ~"<body>" any
    notBodyEnd = ~"</body>" any
    bodyElementEnd = "</body>" ws*
    htmlEnd = "</html>" ws*
    ws = " " | "\\t" | "\\n"
}
htmlSVGUnity <: htmlUnity {
    bodyStuff := bodyStuffPre* svgSection bodyStuffPost*
    bodyStuffPre = ~svgHeader any
    bodyStuffPost = ~"</body>" any
    
    svgSection = svgHeader wh ">" ws* (rect | text)+ "</svg>" ws*
  
    rect = "<rect" ws* id xywh ">" ws* "</rect>" ws*
    text = "<text" ws* id xy ">" ws* htmlchar+ "</text>" ws*
    id = "id=" string
    xywh = xy wh
    xy = "x=" numString "y=" numString
    wh = "width=" numString "height=" numString
    htmlchar = ~">" ~"<" any
    numString = ${ohmQuote} digit+ ${ohmQuote} ws*
    string = ${ohmQuote} notDQuote* ${ohmQuote} ws*
    notDQuote = ~${ohmQuote} any

    svgHeader = "<svg" ws*

    ws := " " | "\\t" | "\\n"
}
`;





	
const grammars = ohm.grammars (addfbGrammar);
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
	    htmlElement: function (html, wss) { return "<" + "html>" + wss.unity ().join (''); },
	    headerStuff: function (stuff) { return stuff.unity ().join (''); },
	    bodyElement: function (body, wss) { return "<" + "body>" + wss.unity ().join ('')},
	    bodyStuff: function (stuff) { return stuff.unity ().join (''); },
	    notBody:function (c) { return c.unity (); },
	    notBodyEnd: function (c) { return c.unity (); },
	    bodyElementEnd: function (body, wss) { return "<" + "/body>" + wss.unity ().join ('');},
	    htmlEnd: function (html, wss) { return "<" + "/html>" + wss.unity ().join ('');},

	    bodyStuff: function (pres, svg, post) { return pres.unity ().join('') + svg.unity () + post.unity (); },

	    bodyStuffPre: function (c) { return c.unity (); },
	    bodyStuffPost: function (stuff) { return stuff.unity (); },
	    svgSection: function (svg, wh, _gt, wss1, elements, endSvg, wss2) {
		return svg.unity () + wh.unity () + ">" + wss1.unity ().join ('') + elements.unity ().join ('') + "<" + "/svg>" + wss2.unity ().join ('');
	    },
	    rect: function (_rect, wss1, id, xywh, gt, wss2, _endRect, wss3) {
		return "<" + "rect" + wss1.unity ().join('') + id.unity () + xywh.unity () + ">" + wss2.unity ().join ('') + "<" + "/rect>" + wss3.unity ().join ('');
	    },
	    text: function (_text, wss1, id, xy, _gt, wss2, cs, _endText, wss3) {
		return "<" + "text" + wss1.unity ().join ('') + id.unity () + xy.unity () + ">" + wss2.unity ().join ('') + "<" + "/text>" + wss3.unity ().join ('');
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
		return "<" + "svg" + wss.unity ().join ('');
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
	    htmlElement: function (html, wss) { return "<" + "html>" + wss.addFactbaseToHTML ().join (''); },
	    headerStuff: function (stuff) { return stuff.addFactbaseToHTML ().join (''); },
	    bodyElement: function (body, wss) { return "<" + "body>" + wss.addFactbaseToHTML ().join ('')},
	    bodyStuff: function (stuff) { return stuff.addFactbaseToHTML ().join (''); },
	    notBody:function (c) { return c.unity (); },
	    notBodyEnd: function (c) { return c.unity (); },
	    bodyElementEnd: function (body, wss) { return "<" + "/body>" + wss.unity ().join ('');},
	    htmlEnd: function (html, wss) { return "<" + "/html>" + wss.unity ().join ('');},

	    bodyStuff: function (pres, svg, post) { return pres.addFactbaseToHTML ().join('') + svg.addFactbaseToHTML () + post.addFactbaseToHTML (); },

	    bodyStuffPre: function (c) { return c.addFactbaseToHTML (); },
	    bodyStuffPost: function (stuff) { return stuff.unity (); },

	    // the switcheroo happens here
	    // emit the raw unity HTML, plus the factbase for the SVG (as a <script> of "fact" calls) 
	    svgSection: function (svg, wh, _gt, wss1, elements, endSvg, wss2) {
		return svg.unity () + wh.unity () + ">" +
		    wss1.unity ().join ('') + elements.unity ().join ("") + "<" + "/svg>" +
		    wss2.unity ().join ('') +
		    "<" + "script>\n" +
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
		return "<" + "svg" + wss.unity ().join ('');
	    },

	    ws: function (c) { 
		return c.unity ();
	    },

	    _terminal: function () { return this.primitiveValue; }
	});
    
    console.log (semantics (parseTree).addFactbaseToHTML ());
}
