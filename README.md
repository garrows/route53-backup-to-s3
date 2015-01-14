route53-backup-to-s3
====================

Backup all your Amazon's Route53 zone files to S3


Setup
-----
Install command
```
npm install -g route53-backup-to-s3
```

The AWS-SDK will pickup your servers IAM credentials if it has them. Otherwise use a config file in the following format.
```
{
  "accessKeyId": "your-access-key",
  "secretAccessKey": "your-secret-key",
  "region": "us-east-1"
}
```
Call the filename `aws-credentials.json`.

Run
---

```
route53-backup-to-s3 --config ./aws-credentials.json --s3Bucket your-bucket --s3Folder your-folder
```

Proxy
-----
If you have the `https_proxy` environment variable set, the AWS API calls will go through that.

If you want to specify another proxy use the `--proxy` flag.
```
route53-backup-to-s3 --config ./aws-credentials.json --s3Bucket s3://your-bucket/your-folder --proxy http://proxy.example.com:3128/
```
