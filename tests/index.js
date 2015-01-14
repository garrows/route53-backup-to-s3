var should = require('should');


describe('route53-backup-to-s3', function() {

  it('should not crash', function(testsDone) {

    var Backuper = require('../index.js');
    var options = {
      s3bucket: 's3://test-bucket/test-folder',
      config: null,
      proxy: null
    };
    var backuper = new Backuper(options);
    //backuper.start();

    //should(error).not.be.ok;

    testsDone();

  });

});