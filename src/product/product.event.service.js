const AWS = require("aws-sdk");
const { productFromJson } = require("./product");
const { createEvent } = require("./product.event")

const TOPIC_ARN =
  process.env.TOPIC_ARN || "arn:aws:sns:ap-southeast-2:000000000000:products";

class ProductEventService {
  async create(event) {
    const product = productFromJson(event);
    await this.publish(createEvent(product, "CREATED"));
  }

  async update(event) {
    const product = productFromJson(event);
    await this.publish(createEvent(product, "UPDATED"));
  }

  async delete(event) {
    const product = productFromJson(event);
    await this.publish(createEvent(product, "DELETED"));
  }

  async publish(message) {
    const SNS = new AWS.SNS({
      endpoint: process.env.AWS_SNS_ENDPOINT,
      region: process.env.AWS_REGION
    });

    const params = {
      Message: JSON.stringify(message),
      TopicArn: TOPIC_ARN,
    };

    console.log("ProductEventService - sending message:", message);

    return SNS.publish(params).promise();
  }
}

const incrementVersion = (v) => {
  const version = (v) ? parseInt(v.match(/[0-9]+/g)[0], 10) + 1 : 1
  return `v${version}`;
};

module.exports = {
  ProductEventService,
  createEvent,
};
