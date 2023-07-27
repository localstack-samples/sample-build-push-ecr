SHELL := /bin/bash

-include envs.makefile

.PHONY: clean update-deps delete-zips iac-shared local-top-level

PKG_SUB_DIRS := $(dir $(shell find . -type d -name node_modules -prune -o -type d -name "venv*" -prune -o -type f -name package.json -print))

PULUMI_CONFIG = pulumi config --stack $(STACK_PREFIX).$(STACK_SUFFIX) --cwd $(STACK_DIR)

# Put application specific targets in this file
include application.makefile

update-deps: $(PKG_SUB_DIRS)
	for i in $(PKG_SUB_DIRS); do \
        pushd $$i && ncu -u && yarn install && popd; \
    done

non-toplevel-deploy: up-deploy
non-toplevel-destroy: destroy
non-toplevel-preview: pulumi-preview
non-toplevel-refresh: refresh

non-db-deploy: up-deploy
non-db-destroy: destroy
non-db-refresh: refresh
non-db-preview: pulumi-preview
non-db-outputs: pulumi-outputs

non-jump-deploy: up-deploy
non-jump-destroy: destroy

non-lsgdc-deploy: build up-deploy
non-lsgdc-destroy: destroy
non-lsgdc-refresh: refresh

local-toplevel-deploy: up-deploy
local-toplevel-destroy: destroy
local-toplevel-preview: pulumi-preview
local-toplevel-outputs: pulumi-outputs

local-ecr-deploy: up-deploy
local-ecr-destroy: destroy
local-ecr-outputs: pulumi-outputs
local-ecr-test: test
local-ecr-unittest: unittest


local-destroy-all:
	make local-ecr-destroy
	make local-toplevel-destroy

iac-shared:
	pushd ./iac/pulumi/typescript/iac-shared && yarn install && yarn run build && popd

stack-init: iac-shared
	mkdir -p ./global-iac
	pushd $(STACK_DIR) && yarn install && popd;
	pulumi stack select -c $(STACK_PREFIX).$(STACK_SUFFIX) --non-interactive --cwd $(STACK_DIR)

up-deploy: stack-init stack-init-application
	pulumi up -ys $(STACK_PREFIX).$(STACK_SUFFIX) --cwd $(STACK_DIR)

pulumi-preview: stack-init stack-init-application
	pulumi preview --diff --cwd $(STACK_DIR)

pulumi-outputs: stack-init stack-init-application
	pulumi stack output -s $(STACK_PREFIX).$(STACK_SUFFIX) --cwd $(STACK_DIR) --show-secrets

destroy: stack-init stack-init-application
	pulumi destroy --cwd $(STACK_DIR)

remove: stack-init stack-init-application
	pulumi stack rm $(STACK_PREFIX).$(STACK_SUFFIX) --cwd $(STACK_DIR)

refresh: stack-init stack-init-application
	pulumi refresh -s $(STACK_PREFIX).$(STACK_SUFFIX) --cwd $(STACK_DIR)

cancel: stack-init stack-init-application
	pulumi cancel -s $(STACK_PREFIX).$(STACK_SUFFIX) --cwd $(STACK_DIR)

stack-output: stack-init stack-init-application
	pulumi stack -u -s $(STACK_PREFIX).$(STACK_SUFFIX) --cwd $(STACK_DIR)

