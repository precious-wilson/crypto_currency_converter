import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({});

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { from = "BTC", to = "EUR", amount = 1, result = 0 } = body;

    const conversionId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    await ddbClient.send(
      new PutItemCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
          ConversionId: { S: conversionId },
          Pair: { S: `${from}->${to}` },
          Amount: { N: String(amount) },
          Result: { N: String(result) },
          Timestamp: { S: new Date().toISOString() },
        },
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        success: true,
        conversionId,
        message: "Conversion logged to DynamoDB",
      }),
    };
  } catch (error) {
    console.error("Error logging conversion:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};