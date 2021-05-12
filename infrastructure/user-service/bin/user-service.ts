#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { UserServicePipelineStack } from '../lib/user-service-pipeline-stack';

const app = new cdk.App();
const userServicePipelineStack = new UserServicePipelineStack(app, 'user-service-ci-cd');
cdk.Tags.of(userServicePipelineStack).add("service", "user-service");
cdk.Tags.of(userServicePipelineStack).add("pipeline", "user-service-pipeline");
cdk.Tags.of(userServicePipelineStack).add("env", "prod");