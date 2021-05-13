# sam-lambda-cicd

CICD Sample for lambda + SAM

## Setup

```zsh
cd infrastructure/user-service

npm install

npm run build

# you will need to do cdk bootstrap in case this is your first cdk deployment
cdk bootstrap

cdk deploy user-service-ci-cd
```

## Steps

1. Got to AWS / S3 and find a bucket that has `user-service-artifacts-bucket` as part of it's name.
1. Open another browser tab
1. Go to AWS / CodeBuild
1. Run the build multiple times
1. observe the new package created for lambda in an s3 bucket under  `/user-service/`

## Cleanup

```zsh
cdk destroy user-service-ci-cd
```
