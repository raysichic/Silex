//////////////////////////////////////////////////
// Silex, live web creation
// http://projects.silexlabs.org/?/silex/
//
// Copyright (c) 2012 Silex Labs
// http://www.silexlabs.org/
//
// Silex is available under the GPL license
// http://www.silexlabs.org/silex/silex-licensing/
//////////////////////////////////////////////////

'use strict';

// node modules
const Path = require('path');
const fs = require('fs');
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('cookie-session');
const serveStatic = require('serve-static');
const WebsiteRouter = require('./WebsiteRouter.js');
const CloudExplorerRouter = require('./CloudExplorerRouter.js');
const PublishRouter = require('./PublishRouter.js');
const SslRouter = require('./SslRouter.js');
const bodyParser = require('body-parser');

// 6805 is the date of sexual revolution started in paris france 8-)
const port = process.env.PORT || 6805;
const rootUrl = process.env.SERVER_URL || `http://localhost:${port}`;

const app = express();

// compress gzip when possible
app.use(compression());

// cookie & session
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.text({limit: '10mb'}));
app.use(cookieParser());
app.use(session({
  name: 'silex-session',
  secret: process.env.SILEX_SESSION_SECRET || 'test session secret'
}));

// create the routes for unifile/CloudExplorer
// and for Silex tasks
const cloudExplorerRouter = new CloudExplorerRouter(rootUrl + '/ce');
app.use('/ce', cloudExplorerRouter);
app.use(new WebsiteRouter(port, rootUrl, cloudExplorerRouter.unifile));
app.use(new PublishRouter(port, rootUrl, cloudExplorerRouter.unifile));
app.use(new SslRouter(app));

// add static folders to serve silex files
app.use('/', serveStatic(Path.join(__dirname, '../../dist/client')));
// debug silex, for js source map
app.use('/js/src', serveStatic(Path.join(__dirname, '../../src')));
// the scripts which have to be available in all versions (v2.1, v2.2, v2.3, ...)
app.use('/static', serveStatic(Path.join(__dirname, '../../static')));

// Start Silex as an Electron app
if(process.env.SILEX_ELECTRON) {
  require(Path.join(__dirname, 'silex_electron'));
}

// server 'loop'
app.listen(port, function() {
  console.log('Listening on ' + port);
});


