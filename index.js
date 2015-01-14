var AWS = require('aws-sdk'),
  fs = require('fs'),
  async = require('async'),
  proxyAgent = require('proxy-agent'),
  path = require('path');

function Backuper(opts) {
  var credentialsFilePath = './aws-credentials.json';
  if (opts.config) {
    credentialsFilePath = opts.config;
  }

  if (fs.existsSync(credentialsFilePath)) {
    AWS.config.loadFromPath(credentialsFilePath);
  } else if (fs.existsSync(path.join(process.cwd(), credentialsFilePath))) {
    AWS.config.loadFromPath(path.join(process.cwd(), credentialsFilePath));
  } else {
    console.warn('Warning: Can not find credentials file.')
  }

  var proxy = process.env.https_proxy;
  proxy = opts.proxy ? opts.proxy : proxy;

  if (proxy) {
    console.log('Using https proxy', proxy);
    AWS.config.update({
      httpOptions: {
        agent: proxyAgent(proxy, true)
      }
    });
  }

  this.queue = async.queue(this.processZoneFile.bind(this), 1);
  this.ses = new AWS.S3();
  this.route53 = new AWS.Route53();

}

Backuper.prototype = {

  start: function() {
    this.getZoneFiles(function(err, files) {
      if (err) {
        console.error('Error getting zone files.');
        throw err;
      }
      this.queue.push(files);
    });
  },

  getZoneFiles: function() {

  },

  processZoneFile: function(zoneFile, callback) {

    callback(null);
  },

  sendToS3: function(zoneFile, callback) {

    callback(null);
  }
}

module.exports = Backuper;