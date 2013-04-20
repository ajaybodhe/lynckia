#!/bin/bash
FILE=../dist/helium.js
rm $FILE
cat ../src/fileShare.js >> $FILE
