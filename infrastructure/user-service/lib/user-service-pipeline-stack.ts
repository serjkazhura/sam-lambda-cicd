import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import * as codeBuild from '@aws-cdk/aws-codebuild';
import { CfnOutput, RemovalPolicy } from '@aws-cdk/core';

export class UserServicePipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const artifactsBucket = new s3.Bucket(this, "user-service-artifacts-bucket", {
        autoDeleteObjects: true,
        removalPolicy: RemovalPolicy.DESTROY
    });

    const codeBuildRole = new iam.Role(this, 'ActionRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeBuildAdminAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess')
      ],
      // the role has to have a physical name set
      roleName: 'User-Service-Code-Build-Role',
    });

    new CfnOutput(this, "bucket", {
      value: artifactsBucket.bucketName,
      description: 'artifacts bucket name'
    });

    const buildProject = new codeBuild.Project(this, 'CodeBuildProject', {
      environment: { buildImage: codeBuild.LinuxBuildImage.AMAZON_LINUX_2_3 },
      environmentVariables: {
        'PACKAGE_BUCKET': {
          value: artifactsBucket.bucketName
        }
      },
      role: codeBuildRole,
      source: codeBuild.Source.gitHub({
        owner: 'serjkazhura',
        repo: 'sam-lambda-cicd',
        cloneDepth: 0, // download full history
        fetchSubmodules: true,
        branchOrRef: 'main'
      }),
      buildSpec: codeBuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: 12,
              python: 3.8
            }
          },
          'pre_build': {
            commands: [
              'pip3 install --upgrade aws-sam-cli',
              'cd services/user-service/users-lambda',
              'npm install'
            ]
          },
          build: {
            commands: [
              'cd ..',
              'sam build --debug',
              'sam package --s3-bucket $PACKAGE_BUCKET --s3-prefix \'user-service\' --output-template-file packaged.yaml --debug',
              'aws s3 cp packaged.yaml s3://$PACKAGE_BUCKET/user-service/'
            ]
          }
        }
      })
    });
  }
}