var AWS = require('aws-sdk'),
  fs = require('fs'),
  async = require('async'),
  proxyAgent = require('proxy-agent'),
  path = require('path');

var options;

function Backuper(opts) {
  var credentialsFilePath = './aws-credentials.json';
  options = opts;
  options.startTime = new Date();
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
  this.s3 = new AWS.S3();
  this.route53 = new AWS.Route53();

}

Backuper.prototype = {

  start: function(callback) {
    var self = this;

    self.queue.drain = function() {
      if (typeof callback == 'function') {
        console.log('All zone files backed up.');
        callback();
      }
    };

    self.listZoneFiles(function(err, files) {
      if (err) {
        console.error('Error getting zone files.');
        throw err;
      }
      self.queue.push(files);
    });
  },

  listZoneFiles: function(callback, marker, zones) {
    var self = this;
    if (!zones) {
      zones = [];
    }

    var params = {
      // DelegationSetId: 'STRING_VALUE',
      // Marker: 'STRING_VALUE',
      // MaxItems: '3'
    };
    if (marker) {
      params.Marker = marker;
    }

    self.route53.listHostedZones(params, function(err, data) {
      if (err) {
        return callback(err);
      }
      for (var i = 0; i < data.HostedZones.length; i++) {
        zones.push(data.HostedZones[i]);
      }

      if (data.IsTruncated) {
        marker = data.NextMarker;
        return self.listZoneFiles(callback, marker, zones);
      }
      console.log('Found ' + zones.length + ' zone files');
      callback(err, zones);
    });

  },

  processZoneFile: function(zoneFile, callback) {
    var self = this;
    async.waterfall(
      [
        function(done) {
          self.getRecordSets(zoneFile, done);
        },
        function(recordSets, done) {
          self.sendToS3(zoneFile, recordSets, done);
        },
      ],
      function(err) {
        callback(err);
      }
    );
  },

  getRecordSets: function(zoneFile, callback, marker, recordSets) {
    var self = this;

    if (!recordSets) {
      recordSets = [];
    }

    console.log('Getting ' + zoneFile.Name + ' record sets.');

    var params = {
      HostedZoneId: zoneFile.Id,
      // MaxItems: '2',
      // StartRecordIdentifier: 'STRING_VALUE',
      // StartRecordName: 'STRING_VALUE',
      // StartRecordType: 'SOA | A | TXT | NS | CNAME | MX | PTR | SRV | SPF | AAAA'
    };
    if (marker) {
      params.StartRecordIdentifier = marker.NextRecordIdentifier;
      params.StartRecordName = marker.NextRecordName;
      params.StartRecordType = marker.NextRecordType;
    }
    self.route53.listResourceRecordSets(params, function(err, data) {
      if (err) {
        console.log('Error getting ' + zoneFile.Name + '\'s record sets.', err, err.stack);
        return callback(err);
      }
      for (var i = 0; i < data.ResourceRecordSets.length; i++) {
        recordSets.push(data.ResourceRecordSets[i]);
      }

      if (data.IsTruncated) {
        marker = {
          NextRecordName: data.NextRecordName,
          NextRecordType: data.NextRecordType,
          NextRecordIdentifier: data.NextRecordIdentifier
        };
        return self.getRecordSets(zoneFile, callback, marker, recordSets);
      }
      console.log('Found ' + recordSets.length + ' record sets files in ' + zoneFile.Name);
      callback(err, recordSets);
    });

  },

  sendToS3: function(zoneFile, recordSets, callback) {
    var self = this;

    zoneFile.recordSets = recordSets;
    var backupStr = JSON.stringify(zoneFile);
    var s3Path = path.join(options.s3folder, options.startTime.toISOString(), zoneFile.Name);
    var params = {
      Bucket: options.s3bucket,
      Key: s3Path,
      ACL: 'private',
      Body: backupStr
    };
    self.s3.putObject(params, function(err, data) {
      if (err) {
        console.log('Error writing to S3', err, err.stack);
        return callback(err);
      }
      console.log('Successfully backed up ' + zoneFile.Name + ' to s3://' + options.s3bucket + '/' + s3Path);
      callback();
    });
  }
}

module.exports = Backuper;