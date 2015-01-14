var should = require('should');

var backuper;
describe('route53-backup-to-s3', function() {
  this.timeout(10000);

  before(function() {
    var Backuper = require('../index.js');
    var options = {
      s3bucket: 'route53-backup-bucket',
      s3folder: 'route53-backups',
      config: null,
      proxy: null
    };
    backuper = new Backuper(options);
  })

  it('should backup zonefiles', function(testsDone) {

    backuper.start(function() {
      testsDone();
    });
  });

  it('should list zone files', function(testsDone) {

    backuper.getZoneFiles(function(error, files) {

      should(error).not.be.ok;
      should(files).be.ok;
      files.should.be.type('object');

      testsDone();
    });
  });

  it('should get record sets', function(testsDone) {

    var zone = {
      "Id": "/hostedzone/Z36RKMTRQO71B2",
      "Name": "w3dt.net.",
      "CallerReference": "c4cb813c-9cf3-432c-83dd-712a22de1264",
      "Config": {
        "PrivateZone": false
      },
      "ResourceRecordSetCount": 35
    };

    backuper.getRecordSets(zone, function(error, recordSets) {
      should(error).not.be.ok;
      should(recordSets).be.ok;
      recordSets.should.be.type('object');
      testsDone();
    });
  });

  it('should backup to s3', function(testsDone) {

    var zone = {
      "Id": "/hostedzone/Z36RKMTRQO71B2",
      "Name": "w3dt.net.",
      "CallerReference": "c4cb813c-9cf3-432c-83dd-712a22de1264",
      "Config": {
        "PrivateZone": false
      },
      "ResourceRecordSetCount": 35
    };
    var recordSets = [{
      "Name": "w3dt.net.",
      "Type": "A",
      "SetIdentifier": "AUSTRALIA",
      "Region": "ap-southeast-2",
      "ResourceRecords": [],
      "AliasTarget": {
        "HostedZoneId": "Z36RKMTRQO71B2",
        "DNSName": "au.w3dt.net.",
        "EvaluateTargetHealth": false
      },
      "HealthCheckId": "41d3225f-906f-45ed-b84a-8aaba5b3fa36"
    }, {
      "Name": "www.w3dt.net.",
      "Type": "CNAME",
      "TTL": 60,
      "ResourceRecords": [{
        "Value": "us.w3dt.net"
      }]
    }];

    backuper.sendToS3(zone, recordSets, function(error) {
      should(error).not.be.ok;
      testsDone();
    });
  });

});