#!/bin/bash
#cat preamble.js toorg.js unity.ohm unity-semantics.js >temp.js
#node temp.js --input=top.html >transpiled.js
cat preamble.js prologsupport.js prologpreamble.js addfb.ohm prologmidamble.js addfb-semantics.js >temp.js
node temp.js --input=top.html >transpiled.html

#cat preamble.js prologsupport.js prolog.js prologpreamble.js addfb.ohm addfb-semantics.js  prologpostamble.js >temp.js

