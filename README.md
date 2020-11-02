# Example Provider

[![Build Status](https://travis-ci.com/pactflow/example-provider-js-sns.svg?branch=master)](https://travis-ci.com/pactflow/example-provider-js-sns)

This is an example of a Node provider that uses Pact, [Pactflow](https://pactflow.io) and Github Actions to ensure that it is compatible with the expectations its consumers have of it.

It is using a public tenant on Pactflow, which you can access [here](https://test.pact.dius.com.au) using the credentials `dXfltyFMgNOFZAxr8io9wJ37iUpY42M`/`O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1`. The latest version of the Example Consumer/Example Provider pact is published [here](https://test.pact.dius.com.au/pacts/provider/pactflow-example-provider-js-sns/consumer/pactflow-example-consumer/latest).

## Pact verifications

When using Pact in a CI/CD pipeline, there are two reasons for a pact verification task to take place:

   * When the provider changes (to make sure it does not break any existing consumer expectations)
   * When a pact changes (to see if the provider is compatible with the new expectations)

When the provider changes, the pact verification task runs as part the provider's normal build pipeline, generally after the unit tests, and before any deployment takes place. This pact verification task is configured to dynamically fetch all the relevant pacts for the specified provider from Pactflow, verify them, and publish the results back to Pactflow.

To ensure that a verification is also run whenever a pact changes, we create a webhook in Pactflow that triggers a provider build, and passes in the URL of the changed pact. Ideally, this would be a completely separate build from your normal provider pipeline, and it should just verify the changed pact.


## Usage

See the [Pactflow CI/CD Workshop](https://github.com/pactflow/ci-cd-workshop).


* Create a product: `make create-product`
* Update a product: `make update-product`
* Delete a product: `make delete-product`