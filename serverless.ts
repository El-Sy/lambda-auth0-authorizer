import * as Dotenv from 'dotenv';
Dotenv.config();

import type { AWS } from '@serverless/typescript';

import authenticate from '@functions/authenticate';

const serverlessConfiguration: AWS = {
  service: process.env.SERVICE_NAME,
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    region:'ap-southeast-1',
    stage:'prod',
    architecture:"arm64",
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: process.env.AWS_NODEJS_CONNECTION_REUSE_ENABLED,
      NODE_OPTIONS: process.env.NODE_OPTIONS,
      JWKS_URI:process.env.JWKS_URI,
      AUDIENCE:process.env.AUDIENCE,
      TOKEN_ISSUER:process.env.TOKEN_ISSUER
    },
    iam: {
      role: process.env.IAM_ROLE
    }
  },
  // useDotenv:true, // not working. probably only for serverless-offline
  functions: { 
    authenticate:{
      handler: authenticate.handler,
      provisionedConcurrency:5
    }
  },
  custom: {
    esbuild: {
      bundle: true,
      minify: true,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
