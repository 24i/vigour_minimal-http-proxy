#!/usr/bin/env node
'use strict'
const server = require('../server')
const port = process.arguments[0]
server(port)
