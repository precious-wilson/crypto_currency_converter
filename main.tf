# 1. Zip the Lambda backend code automatically
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/backend"
  output_path = "${path.module}/lambda_function.zip"
}

# 2. IAM Execution Role for Lambda
resource "aws_iam_role" "lambda_exec" {
  name = "crypto_converter_lambda_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# Allow Lambda to write logs to CloudWatch
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Least-privilege IAM policy: ONLY allow writing to our specific DynamoDB table
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "crypto_lambda_dynamodb_write"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["dynamodb:PutItem", "dynamodb:GetItem"]
      Resource = aws_dynamodb_table.conversion_history.arn
    }]
  })
}

# 3. Lambda Function
resource "aws_lambda_function" "converter_api" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "CryptoConverterBackend"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = "nodejs24.x"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.conversion_history.name
    }
  }
}

# 4. API Gateway (HTTP API v2)
resource "aws_apigatewayv2_api" "lambda_api" {
  name          = "crypto-converter-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["Content-Type"]
  }
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.lambda_api.id
  name        = "prod"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = aws_apigatewayv2_api.lambda_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.converter_api.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "post_convert" {
  api_id    = aws_apigatewayv2_api.lambda_api.id
  route_key = "POST /convert"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.converter_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.lambda_api.execution_arn}/*/*/convert"
}

# Print the live API URL once deployed
output "api_endpoint" {
  value = "${aws_apigatewayv2_api.lambda_api.api_endpoint}/prod/convert"
}