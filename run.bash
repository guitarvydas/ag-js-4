#!/bin/bash
cat preamble.js toorg.js unity.ohm unity-semantics.js >temp.js
node temp.js --input=top.html >transpiled.js

