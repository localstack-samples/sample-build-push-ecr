# LocalStack ECR Project

This project uses mutliple IaC frameworks to deploy a Docker registry to AWS ECR, build a Docker image,
and deploy the image to the ECR repo. Changes to files in the `./app` directory will cause the Docker
image to be rebuilt with the tag `latest` and redeployed.

# Setup

### Assumptions

- Latest DockerDesktop installed and running

### Setup steps

1. Install Node Version Manager (NVM)
   https://github.com/nvm-sh/nvm#installing-and-updating
2. Select Node version 18

```shell
nvm install 18
```

3. Install Terraform CDK

```shell
npm install --global cdktf-cli@latest
```

4. Create a Python VENV (virtual env) and Install LocalStack CLI

```shell
make setup-venv
# make sure to use the venv by sourcing it
source venv/bin/activate
```

5. Start LocalStack

```shell
DEBUG=1 ENFORCE_IAM=1 localstack start
```

# Terraform CDK IaC Instructions

This assumes your shells are using the NVM by running `nvm use node` and you have your python venv set by
running `source venv/bin/activate`

### Install pipeline packages

You need to do this initially, and if you manually add packages to `iac/terraform/cdk/package.json`

```shell
make local-cdktf-install
```

### Deploy ECR Stack

```shell
make local-cdktf-deploy
```

# Pulumi IaC Instructions

There is an issue with the ECR deployment to LocalStack in this repo right now. 