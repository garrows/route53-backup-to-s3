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
route53-backup-to-s3 --config ./aws-credentials.json --s3bucket your-bucket --s3folder your-folder
```

Multi Credentials
-----------------

If you need to separate your Route53 and S3 credentials use the `--r53config` and `--s3config` flags.

```
route53-backup-to-s3 --r53config ./r53-credentials.json --s3config ./s3-credentials.json --s3bucket your-bucket --s3Folder your-folder
```

Proxy
-----
If you have the `https_proxy` environment variable set, the AWS API calls will go through that.

If you want to specify another proxy use the `--proxy` flag.
```
route53-backup-to-s3 --config ./aws-credentials.json --s3bucket s3://your-bucket/your-folder --proxy http://proxy.example.com:3128/
```
