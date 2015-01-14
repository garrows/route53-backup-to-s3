#!/usr/bin/env node

var program = require('commander'),
  packageInfo = require('../package.json');

program
  .version(packageInfo.version)
  .option('-b, --s3bucket <bucket>', 'S3 bucket name (eg s3://your-bucket-name/your-folder)')
  .option('-c, --config <path>', 'set config path. Defaults to ./aws-credentials.json')
  .option('-x, --proxy <server>', 'set the proxy server. Defaults to https_proxy environment variable.')
  .parse(process.argv);

var Backuper = require('../index.js');
var options = {
  s3bucket: program.s3bucket,
  config: program.config,
  proxy: program.proxy
};

var backuper = new Backuper(options);
backuper.start();