# Set Pulumi Configuration here
#
#   Configuration should be added using the template;
#   	$(PULUMI_CONFIG) set <pulumi-variable> $(<makefile-variable>)
#
stack-init-application:
	$(PULUMI_CONFIG) set-all \
	--plaintext local_arch=$(LOCAL_ARCH) \
	--plaintext aws_region=$(AWS_REGION) \
	--plaintext aws_account=$(AWS_ACCOUNT) \
	--plaintext aws_account_type=$(AWS_ACCOUNT_TYPE) \
	--plaintext logging_level=$(LOGGING_LEVEL)


# TODO make venv creation dynamic
# Setup python
setup-venv: requirements-dev.txt
	/usr/local/pyenv/shims/python3 -m venv --clear venv
	( \
	source venv/bin/activate; \
	python3 -m pip install --upgrade pip; \
	pip3 install -r requirements-dev.txt; \
	);

reset:
	- stop-ls.sh
	- rm iac/Pulumi.*.yaml
	- rm -rf ./global-iac/.pulumi
	- rm -rf iac/.pulumi
	- start-ls.sh

it-again: reset
	make local-toplevel-deploy
	make local-ecr-deploy

