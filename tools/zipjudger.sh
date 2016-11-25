#!/bin/sh
cd judger
npm i
zip -r ../server/public/tuoj-judger.zip ./*
