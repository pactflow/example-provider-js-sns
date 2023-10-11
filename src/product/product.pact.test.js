/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */
const { MessageProviderPact, providerWithMetadata } = require("@pact-foundation/pact");
const { Product } = require("./product");
const { createEvent } = require("./product.event");
const cp = require("child_process");

describe("Message provider tests", () => {
  let revision;
  let branch;

  try {
    revision = cp
      .execSync("git rev-parse HEAD", { stdio: "pipe" })
      .toString()
      .trim();
  } catch (Error) {
    console.log(Error);
    throw new TypeError(
      "Couldn't find a git commit hash, is this a git directory?"
    );
  }

  try {
    branch = cp
      .execSync("git rev-parse --abbrev-ref HEAD", { stdio: "pipe" })
      .toString()
      .trim();
  } catch (Error) {
    throw new TypeError("Couldn't find a git branch, is this a git directory?");
  }

  const baseOpts = {
    logLevel: process.env.PACT_LOG_LEVEL ? process.env.PACT_LOG_LEVEL : "INFO",
    providerVersionBranch: process.env.GIT_BRANCH ?? branch,
    providerVersion: process.env.GIT_COMMIT ?? revision,
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
    // consumerVersionTags: ["master", "prod", "main"], //the old way of specifying which pacts to verify
    consumerVersionSelectors: [{ deployedOrReleased: true } ], // the new way of specifying which pacts to verify

    // Specifying a particular consumer, and the latest pact (non determinstic - used for demonstration!)
    // consumerVersionSelectors: [{ consumer: 'pactflow-example-consumer-js-sns', latest: true } ],
    pactBrokerUrl: process.env.PACT_BROKER_BASE_URL ?? "http://localhost:8000",
    enablePending: true,
  };

  const opts = {
    ...baseOpts,
    ...(process.env.PACT_URL ? pactChangedOpts : fetchPactsDynamicallyOpts),
    ...(process.env.PACT_PUBLISH_VERIFICATION_RESULTS === "true"
      ? { publishVerificationResult: true }
      : {}),
      messageProviders: {
        'a product event update': providerWithMetadata(() => createEvent(new Product("42", "food", "pizza"), "UPDATED"), {
          topic: 'products',
        }),
      },
  };

  const p = new MessageProviderPact(opts);

  describe("send an event", () => {
    it("a product event update", () => {
      return p.verify();
    });
  });
});
