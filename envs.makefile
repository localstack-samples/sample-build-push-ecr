# default localhost env vars
export PULUMI_CONFIG_PASSPHRASE ?= ecr-432
export LOCALSTACK_ENDPOINT=http://host.docker.internal:4566
export APP_NAME = ecr
export AWS_REGION=us-east-1

export IS_LOCAL=true
export LOGGING_LEVEL=DEBUG
export PULUMI_BACKEND_URL ?= file://$(shell pwd)/global-iac
export AWS_ACCOUNT=000000000000
export AWS_ACCOUNT_TYPE=LOCALSTACK
export STACK_SUFFIX=local
export HOSTED_ZONE_NAME=non.local
export ACTIVE_PROFILES=none



# Pattern specific variables for each pipeline
local-%: export LOCALSTACK=1
local-cdktf%: export STACK_DIR=iac/terraform/cdk
local-cdktf%: export STACK_PREFIX=ecr

local-ecr%: export STACK_DIR=iac/pulumi/typescript/ecr
local-ecr%: export STACK_PREFIX=ecr

local-ecr-docker%: export STACK_DIR=iac/pulumi/ts-docker-provider/ecr
local-ecr-docker%: export STACK_PREFIX=ecrd

local-toplevel%: export STACK_DIR=iac/pulumi/typescript/top-level
local-toplevel%: export STACK_PREFIX=toplevel
local-toplevel%: export VPC_CIDR_BLOCK=10.10.0.0/16

local-toplevel-docker%: export STACK_DIR=iac/pulumi/ts-docker-provider/top-level
local-toplevel-docker%: export STACK_PREFIX=topleveld

#NONPROD pipeline vars
non%: export DOCKER_DEFAULT_PLATFORM=linux/arm64
non%: export IS_LOCAL=false
non%: export LOGGING_LEVEL=INFO
non%: export AWS_ACCOUNT_TYPE=NONPROD
non%: export AWS_REGION=us-east-1
non%: export STACK_SUFFIX=non

non-toplevel%: export STACK_DIR=iac/top-level
non-toplevel%: export STACK_PREFIX=toplevel
non-toplevel%: export VPC_CIDR_BLOCK=10.72.0.0/16

non-ecr-docker%: export STACK_DIR=iac/pulumi/ts-docker-provider/ecr
non-ecr-docker%: export STACK_PREFIX=ecrd

uname_m := $(shell uname -m) # store the output of the command in a variable
export LOCAL_ARCH=$(uname_m)
