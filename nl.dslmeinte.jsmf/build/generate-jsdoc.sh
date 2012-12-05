#!/bin/sh

cd ..
PROJECT=$PWD
cd $JSDOC_HOME
rm -rf $PROJECT/dist/doc
./jsrun.sh -v -t=templates/jsdoc -d=$PROJECT/dist/doc $PROJECT/src

# 
# Installation instructions:
#	1. Download from http://code.google.com/p/jsdoc-toolkit/downloads/detail?name=jsdoc_toolkit-2.4.0.zip
#	2. Unzip it somewhere
#	3. Set env var JSDOC_HOME to point to the 'jsdoc-toolkit' folder
# 
# Run it as:
#	./generate-jsdoc.sh
# 
# Hints obtained from:
#	http://www.kajabity.com/2012/02/how-i-introduced-jsdoc-into-a-javascript-project-and-found-my-eclipse-outline/
#	http://www.kajabity.com/2012/02/automating-jsdoc-with-apache-ant/
# 
# And yes: my Bourne shell style sucks...
# 

