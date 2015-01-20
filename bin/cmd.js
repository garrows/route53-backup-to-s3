#!/usr/bin/env node

var program = require('commander'),
  packageInfo = require('../package.json');

program
  .version(packageInfo.version)
  .option('-b, --s3bucket <bucket>', 'S3 bucket name.')
  .option('-f, --s3folder <folder>', 'S3 folder. Defaults to route53-backups.')
  .option('-c, --config <path>', 'set config path. Defaults to ./aws-credentials.json')
  .option('-r, --r53config <path>', 'set config path for just Route53. Defaults to ./aws-credentials.json')
  .option('-s, --s3config <path>', 'set config path for just S3. Defaults to ./aws-credentials.json')
  .option('-x, --proxy <server>', 'set the proxy server. Defaults to https_proxy environment variable.')
  .parse(process.argv);

var Backuper = require('../index.js');
var options = {
  s3bucket: program.s3bucket,
  s3folder: program.s3folder ? program.s3folder : 'route53-backups',
  proxy: program.proxy
};

options.r53config = program.r53config ? program.r53config : program.config;
options.s3config = program.s3config ? program.s3config : program.config;

var backuper = new Backuper(options);
backuper.start();