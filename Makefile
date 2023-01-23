PACTICIPANT := "pactflow-example-provider-js-sns"
GITHUB_REPO := "pactflow/example-provider-js-sns"
PACT_CHANGED_WEBHOOK_UUID := "0278fe46-09be-4b9d-b037-559d2891f752"
PACT_CLI="docker run --rm -v ${PWD}:${PWD} -e PACT_BROKER_BASE_URL -e PACT_BROKER_TOKEN pactfoundation/pact-cli:latest"
AWS_CLI="docker run --rm -it -e AWS_ACCESS_KEY_ID=1234 -e AWS_SECRET_ACCESS_KEY=1234 amazon/aws-cli --region ap-southeast-2"
AWS_SNS_ENDPOINT := http://localhost:4566
AWS_REGION := ap-southeast-2
export AWS_SNS_ENDPOINT
export AWS_REGION

# Only deploy from master
ifeq ($(GIT_BRANCH),master)
	DEPLOY_TARGET=deploy
else
	DEPLOY_TARGET=no_deploy
endif

all: test

## ====================
## CI tasks
## ====================

ci: test can_i_deploy $(DEPLOY_TARGET)

# Run the ci target from a developer machine with the environment variables
# set as if it was on Github Actions.
# Use this for quick feedback when playing around with your workflows.
fake_ci: .env
	CI=true \
	GIT_COMMIT=`git rev-parse --short HEAD`+`date +%s` \
	GIT_BRANCH=`git rev-parse --abbrev-ref HEAD` \
	PACT_BROKER_PUBLISH_VERIFICATION_RESULTS=true \
	make ci

ci_webhook: .env
	npm run test

fake_ci_webhook:
	CI=true \
	GIT_COMMIT=`git rev-parse --short HEAD`+`date +%s` \
	GIT_BRANCH=`git rev-parse --abbrev-ref HEAD` \
	PACT_BROKER_PUBLISH_VERIFICATION_RESULTS=true \
	make ci_webhook

## =====================
## Build/test tasks
## =====================

test: .env
	npm run test

## =====================
## Deploy tasks
## =====================

deploy: deploy_app record_deployment

no_deploy:
	@echo "Not deploying as not on master branch"

can_i_deploy: .env
	"${PACT_CLI}" broker can-i-deploy --pacticipant ${PACTICIPANT} --version ${GIT_COMMIT} --to-environment production

deploy_app:
	@echo "Deploying to production"

record_deployment: .env
	@"${PACT_CLI}" broker record-deployment --pacticipant ${PACTICIPANT} --version ${GIT_COMMIT} --environment production

## =====================
## PactFlow set up tasks
## =====================

# export the GITHUB_TOKEN environment variable before running this
create_github_token_secret:
	curl -v -X POST ${PACT_BROKER_BASE_URL}/secrets \
	-H "Authorization: Bearer ${PACT_BROKER_TOKEN}" \
	-H "Content-Type: application/json" \
	-H "Accept: application/hal+json" \
	-d  "{\"name\":\"githubToken\",\"description\":\"Github token\",\"value\":\"${GITHUB_TOKEN}\"}"

# NOTE: the github token secret must be created (either through the UI or using the
# `create_travis_token_secret` target) before the webhook is invoked.
create_or_update_pact_changed_webhook:
	"${PACT_CLI}" \
	  broker create-or-update-webhook \
	  "https://api.github.com/repos/${GITHUB_REPO}/dispatches" \
	  --header 'Content-Type: application/json' 'Accept: application/vnd.github.everest-preview+json' 'Authorization: Bearer $${user.githubToken}' \
	  --request POST \
	  --data '{ "event_type": "pact_changed", "client_payload": { "pact_url": "$${pactbroker.pactUrl}" } }' \
	  --uuid ${PACT_CHANGED_WEBHOOK_UUID} \
	  --consumer ${PACTICIPANT} \
	  --contract-content-changed \
	  --description "Pact content changed for ${PACTICIPANT}"

test_pact_changed_webhook:
	@curl -v -X POST ${PACT_BROKER_BASE_URL}/webhooks/${PACT_CHANGED_WEBHOOK_UUID}/execute -H "Authorization: Bearer ${PACT_BROKER_TOKEN}"

## ======================
## Misc
## ======================

.env:
	touch .env

docker-logs:
	@docker-compose -f sns.yml logs -f

docker-rm:
	@docker-compose -f sns.yml rm -vfs

docker-stop:
	@docker-compose -f sns.yml stop

docker:
	@docker-compose -f sns.yml up -d --no-recreate

wait-for-localstack:
	while [[ "`nc -zv 0.0.0.0 4566`" =~ "succeeded" ]]; do sleep 2; done
	sleep 10

create-topic: wait-for-localstack
	@IP=$(shell docker inspect -f '{{ .NetworkSettings.IPAddress }}' localstack_main); \
	"${AWS_CLI}" --endpoint http://$$IP:4566 sns create-topic --name products

start: docker create-topic
	npm start

create-product:
	curl -v -X POST -H"Content-Type: application/json" localhost:8000/products -d '{"type":"pizza", "name":"food"}'

update-product:
	curl -v -X PUT -H"Content-Type: application/json" localhost:8000/products/1 -d '{"type":"pizza", "name":"food", "version":"v1"}'

delete-product:
	curl -v -X DELETE -H"Content-Type: application/json" localhost:8000/products/1 -d '{"type":"pizza", "name":"food", "version":"v1"}'

.PHONY: docker docker-stop docker-rm docker-logs
