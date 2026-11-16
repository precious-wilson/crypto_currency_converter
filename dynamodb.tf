resource "aws_dynamodb_table" "conversion_history" {
  name         = "CryptoConversionHistory"
  billing_mode = "PAY_PER_REQUEST" # Serverless on-demand billing ($0 when idle)
  hash_key     = "ConversionId"

  attribute {
    name = "ConversionId"
    type = "S"
  }

  tags = {
    Project = "CryptoConverter"
  }
}