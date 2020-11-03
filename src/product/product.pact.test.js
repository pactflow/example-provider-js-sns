/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */
const { MessageProviderPact } = require("@pact-foundation/pact");
const { Product } = require("./product");
const { createEvent } = require("./product.event");

describe("Message provider tests", () => {
  const baseOpts = {
    logLevel: "INFO",
    providerVersion: process.env.TRAVIS_COMMIT,
    providerVersionTags: process.env.TRAVIS_BRANCH
      ? [process.env.TRAVIS_BRANCH]
      : [],
  };

  // For builds triggered by a 'contract content changed' webhook,
  // just verify the changed pact. The URL will bave been passed in
  // from the webhook to the CI job.
  const pactChangedOpts = {
    pactUrls: [process.env.PACT_URL],
  };

  // For 'normal' provider builds, fetch `master` and `prod` pacts for this provider
  const fetchPactsDynamicallyOpts = {
    provider: "pactflow-example-provider-js-sns",
    consumerVersionTags: ["master", "prod"], //the old way of specifying which pacts to verify
    // consumerVersionSelectors: [{ tag: 'master', latest: true }, { tag: 'prod', latest: true } ], // the new way of specifying which pacts to verify
    pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
    enablePending: true,
  };

  const opts = {
    ...baseOpts,
    ...(process.env.PACT_URL ? pactChangedOpts : fetchPactsDynamicallyOpts),
    messageProviders: {
      "a product event update": () =>
        createEvent(new Product("42", "food", "pizza"), "UPDATED"),
    },
  };

  const p = new MessageProviderPact(opts);

  describe("send an event", () => {
    it("a product event update", () => {
      return p.verify();
    });
  });
});
