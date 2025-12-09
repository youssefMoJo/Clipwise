resource "aws_api_gateway_rest_api" "safetube_api" {
  name        = "safetube-api"
  description = "API for processing YouTube links"
}

resource "aws_api_gateway_resource" "process" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  parent_id   = aws_api_gateway_rest_api.safetube_api.root_resource_id
  path_part   = "process"
}

resource "aws_api_gateway_method" "post_method" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.process.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito_authorizer.id
}

resource "aws_api_gateway_method" "process_options" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.process.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "process_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.process.id
  http_method = aws_api_gateway_method.process_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{ \"statusCode\": 200 }"
  }
}

resource "aws_api_gateway_method_response" "process_options_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.process.id
  http_method = aws_api_gateway_method.process_options.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "process_options_integration_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.process.id
  http_method = aws_api_gateway_method.process_options.http_method
  status_code = aws_api_gateway_method_response.process_options_response_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'http://localhost:3000'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
  }

  depends_on = [
    aws_api_gateway_integration.process_options_integration
  ]
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.process.id
  http_method = aws_api_gateway_method.post_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.process_video.invoke_arn
}

resource "aws_lambda_permission" "allow_apigateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.process_video.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.safetube_api.execution_arn}/*/*"
}

# Sign-up endpoint
resource "aws_api_gateway_resource" "signup" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  parent_id   = aws_api_gateway_rest_api.safetube_api.root_resource_id
  path_part   = "signup"
}

resource "aws_api_gateway_method" "signup_post" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.signup.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "signup_options" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.signup.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "signup_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.signup.id
  http_method = aws_api_gateway_method.signup_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{ \"statusCode\": 200 }"
  }
}

resource "aws_api_gateway_method_response" "signup_options_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.signup.id
  http_method = aws_api_gateway_method.signup_options.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "signup_options_integration_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.signup.id
  http_method = aws_api_gateway_method.signup_options.http_method
  status_code = aws_api_gateway_method_response.signup_options_response_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'http://localhost:3000'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
  }

  depends_on = [
    aws_api_gateway_integration.signup_options_integration
  ]
}

resource "aws_api_gateway_integration" "signup_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.signup.id
  http_method = aws_api_gateway_method.signup_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.sign_up.invoke_arn
}

resource "aws_lambda_permission" "allow_apigateway_signup" {
  statement_id  = "AllowAPIGatewayInvokeSignup"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.sign_up.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.safetube_api.execution_arn}/*/*"
}

# Log-in endpoint
resource "aws_api_gateway_resource" "login" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  parent_id   = aws_api_gateway_rest_api.safetube_api.root_resource_id
  path_part   = "login"
}

resource "aws_api_gateway_method" "login_post" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.login.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "login_options" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.login.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "login_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.login.id
  http_method = aws_api_gateway_method.login_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{ \"statusCode\": 200 }"
  }
}

resource "aws_api_gateway_method_response" "login_options_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.login.id
  http_method = aws_api_gateway_method.login_options.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "login_options_integration_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.login.id
  http_method = aws_api_gateway_method.login_options.http_method
  status_code = aws_api_gateway_method_response.login_options_response_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'http://localhost:3000'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
  }

  depends_on = [
    aws_api_gateway_integration.login_options_integration
  ]
}

resource "aws_api_gateway_integration" "login_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.login.id
  http_method = aws_api_gateway_method.login_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.log_in.invoke_arn
}

resource "aws_lambda_permission" "allow_apigateway_login" {
  statement_id  = "AllowAPIGatewayInvokeLogin"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.log_in.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.safetube_api.execution_arn}/*/*"
}

# Refresh token endpoint
resource "aws_api_gateway_resource" "refresh" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  parent_id   = aws_api_gateway_rest_api.safetube_api.root_resource_id
  path_part   = "refresh"
}

resource "aws_api_gateway_method" "refresh_post" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.refresh.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "refresh_options" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.refresh.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "refresh_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.refresh.id
  http_method = aws_api_gateway_method.refresh_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{ \"statusCode\": 200 }"
  }
}

resource "aws_api_gateway_method_response" "refresh_options_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.refresh.id
  http_method = aws_api_gateway_method.refresh_options.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "refresh_options_integration_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.refresh.id
  http_method = aws_api_gateway_method.refresh_options.http_method
  status_code = aws_api_gateway_method_response.refresh_options_response_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'http://localhost:3000'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
  }

  depends_on = [
    aws_api_gateway_integration.refresh_options_integration
  ]
}

resource "aws_api_gateway_integration" "refresh_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.refresh.id
  http_method = aws_api_gateway_method.refresh_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.refresh_token.invoke_arn
}

resource "aws_lambda_permission" "allow_apigateway_refresh" {
  statement_id  = "AllowAPIGatewayInvokeRefresh"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.refresh_token.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.safetube_api.execution_arn}/*/*"
}

# Videos endpoint
resource "aws_api_gateway_resource" "videos" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  parent_id   = aws_api_gateway_rest_api.safetube_api.root_resource_id
  path_part   = "videos"
}

resource "aws_api_gateway_method" "videos_get" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.videos.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito_authorizer.id
}

resource "aws_api_gateway_method" "videos_options" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.videos.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "videos_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.videos.id
  http_method = aws_api_gateway_method.videos_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{ \"statusCode\": 200 }"
  }
}

resource "aws_api_gateway_method_response" "videos_options_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.videos.id
  http_method = aws_api_gateway_method.videos_options.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "videos_options_integration_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.videos.id
  http_method = aws_api_gateway_method.videos_options.http_method
  status_code = aws_api_gateway_method_response.videos_options_response_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'http://localhost:3000'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
  }

  depends_on = [
    aws_api_gateway_integration.videos_options_integration
  ]
}

resource "aws_api_gateway_integration" "videos_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.videos.id
  http_method = aws_api_gateway_method.videos_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_videos.invoke_arn
}

resource "aws_lambda_permission" "allow_apigateway_get_videos" {
  statement_id  = "AllowAPIGatewayInvokeGetVideos"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_videos.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.safetube_api.execution_arn}/*/*"
}

# Video details endpoint (GET /videos/{video_id})
resource "aws_api_gateway_resource" "video_id" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  parent_id   = aws_api_gateway_resource.videos.id
  path_part   = "{video_id}"
}

resource "aws_api_gateway_method" "video_get" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.video_id.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito_authorizer.id
}

resource "aws_api_gateway_method" "video_id_options" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.video_id.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "video_id_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.video_id.id
  http_method = aws_api_gateway_method.video_id_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{ \"statusCode\": 200 }"
  }
}

resource "aws_api_gateway_method_response" "video_id_options_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.video_id.id
  http_method = aws_api_gateway_method.video_id_options.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "video_id_options_integration_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.video_id.id
  http_method = aws_api_gateway_method.video_id_options.http_method
  status_code = aws_api_gateway_method_response.video_id_options_response_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'http://localhost:3000'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
  }

  depends_on = [
    aws_api_gateway_integration.video_id_options_integration
  ]
}

resource "aws_api_gateway_integration" "video_get_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.video_id.id
  http_method = aws_api_gateway_method.video_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_video_details.invoke_arn
}

resource "aws_lambda_permission" "allow_apigateway_get_video_details" {
  statement_id  = "AllowAPIGatewayInvokeGetVideoDetails"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_video_details.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.safetube_api.execution_arn}/*/*"
}

# Delete video endpoint (DELETE /videos/{video_id})
resource "aws_api_gateway_method" "video_delete" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.video_id.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito_authorizer.id
}

resource "aws_api_gateway_integration" "video_delete_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.video_id.id
  http_method = aws_api_gateway_method.video_delete.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.delete_video.invoke_arn
}

resource "aws_lambda_permission" "allow_apigateway_delete_video" {
  statement_id  = "AllowAPIGatewayInvokeDeleteVideo"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_video.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.safetube_api.execution_arn}/*/*"
}

# Forgot password endpoint
resource "aws_api_gateway_resource" "forgot_password" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  parent_id   = aws_api_gateway_rest_api.safetube_api.root_resource_id
  path_part   = "forgot-password"
}

resource "aws_api_gateway_method" "forgot_password_post" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.forgot_password.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "forgot_password_options" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.forgot_password.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "forgot_password_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.forgot_password.id
  http_method = aws_api_gateway_method.forgot_password_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{ \"statusCode\": 200 }"
  }
}

resource "aws_api_gateway_method_response" "forgot_password_options_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.forgot_password.id
  http_method = aws_api_gateway_method.forgot_password_options.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "forgot_password_options_integration_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.forgot_password.id
  http_method = aws_api_gateway_method.forgot_password_options.http_method
  status_code = aws_api_gateway_method_response.forgot_password_options_response_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'http://localhost:3000'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
  }

  depends_on = [
    aws_api_gateway_integration.forgot_password_options_integration
  ]
}

resource "aws_api_gateway_integration" "forgot_password_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.forgot_password.id
  http_method = aws_api_gateway_method.forgot_password_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.forgot_password.invoke_arn
}

resource "aws_lambda_permission" "allow_apigateway_forgot_password" {
  statement_id  = "AllowAPIGatewayInvokeForgotPassword"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.forgot_password.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.safetube_api.execution_arn}/*/*"
}

# Reset password endpoint
resource "aws_api_gateway_resource" "reset_password" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  parent_id   = aws_api_gateway_rest_api.safetube_api.root_resource_id
  path_part   = "reset-password"
}

resource "aws_api_gateway_method" "reset_password_post" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.reset_password.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "reset_password_options" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.reset_password.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "reset_password_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.reset_password.id
  http_method = aws_api_gateway_method.reset_password_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{ \"statusCode\": 200 }"
  }
}

resource "aws_api_gateway_method_response" "reset_password_options_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.reset_password.id
  http_method = aws_api_gateway_method.reset_password_options.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "reset_password_options_integration_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.reset_password.id
  http_method = aws_api_gateway_method.reset_password_options.http_method
  status_code = aws_api_gateway_method_response.reset_password_options_response_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'http://localhost:3000'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
  }

  depends_on = [
    aws_api_gateway_integration.reset_password_options_integration
  ]
}

resource "aws_api_gateway_integration" "reset_password_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.reset_password.id
  http_method = aws_api_gateway_method.reset_password_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.reset_password.invoke_arn
}

resource "aws_lambda_permission" "allow_apigateway_reset_password" {
  statement_id  = "AllowAPIGatewayInvokeResetPassword"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.reset_password.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.safetube_api.execution_arn}/*/*"
}

# Feedback endpoint
resource "aws_api_gateway_resource" "feedback" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  parent_id   = aws_api_gateway_rest_api.safetube_api.root_resource_id
  path_part   = "feedback"
}

resource "aws_api_gateway_method" "feedback_post" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.feedback.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "feedback_options" {
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  resource_id   = aws_api_gateway_resource.feedback.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "feedback_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.feedback.id
  http_method = aws_api_gateway_method.feedback_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{ \"statusCode\": 200 }"
  }
}

resource "aws_api_gateway_method_response" "feedback_options_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.feedback.id
  http_method = aws_api_gateway_method.feedback_options.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "feedback_options_integration_response_200" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.feedback.id
  http_method = aws_api_gateway_method.feedback_options.http_method
  status_code = aws_api_gateway_method_response.feedback_options_response_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Guest-ID'"
  }

  depends_on = [
    aws_api_gateway_integration.feedback_options_integration
  ]
}

resource "aws_api_gateway_integration" "feedback_integration" {
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  resource_id = aws_api_gateway_resource.feedback.id
  http_method = aws_api_gateway_method.feedback_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.submit_feedback.invoke_arn
}

resource "aws_lambda_permission" "allow_apigateway_feedback" {
  statement_id  = "AllowAPIGatewayInvokeFeedback"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.submit_feedback.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.safetube_api.execution_arn}/*/*"
}

resource "aws_api_gateway_deployment" "deployment" {
  depends_on  = [
    aws_api_gateway_integration.lambda_integration,
    aws_api_gateway_method.post_method,
    aws_api_gateway_integration.signup_integration,
    aws_api_gateway_method.signup_post,
    aws_api_gateway_method.signup_options,
    aws_api_gateway_integration.signup_options_integration,
    aws_api_gateway_method_response.signup_options_response_200,
    aws_api_gateway_integration_response.signup_options_integration_response_200,
    aws_api_gateway_integration.login_integration,
    aws_api_gateway_method.login_post,
    aws_api_gateway_method.login_options,
    aws_api_gateway_integration.login_options_integration,
    aws_api_gateway_method_response.login_options_response_200,
    aws_api_gateway_integration_response.login_options_integration_response_200,
    aws_api_gateway_integration.refresh_integration,
    aws_api_gateway_method.refresh_post,
    aws_api_gateway_method.refresh_options,
    aws_api_gateway_integration.refresh_options_integration,
    aws_api_gateway_method_response.refresh_options_response_200,
    aws_api_gateway_integration_response.refresh_options_integration_response_200,
    aws_api_gateway_integration.forgot_password_integration,
    aws_api_gateway_method.forgot_password_post,
    aws_api_gateway_method.forgot_password_options,
    aws_api_gateway_integration.forgot_password_options_integration,
    aws_api_gateway_method_response.forgot_password_options_response_200,
    aws_api_gateway_integration_response.forgot_password_options_integration_response_200,
    aws_api_gateway_integration.reset_password_integration,
    aws_api_gateway_method.reset_password_post,
    aws_api_gateway_method.reset_password_options,
    aws_api_gateway_integration.reset_password_options_integration,
    aws_api_gateway_method_response.reset_password_options_response_200,
    aws_api_gateway_integration_response.reset_password_options_integration_response_200,
    aws_api_gateway_integration.feedback_integration,
    aws_api_gateway_method.feedback_post,
    aws_api_gateway_method.feedback_options,
    aws_api_gateway_integration.feedback_options_integration,
    aws_api_gateway_method_response.feedback_options_response_200,
    aws_api_gateway_integration_response.feedback_options_integration_response_200,
    aws_api_gateway_integration.videos_integration,
    aws_api_gateway_method.videos_get,
    aws_api_gateway_method.videos_options,
    aws_api_gateway_integration.videos_options_integration,
    aws_api_gateway_method_response.videos_options_response_200,
    aws_api_gateway_integration_response.videos_options_integration_response_200,
    aws_api_gateway_integration.video_get_integration,
    aws_api_gateway_method.video_get,
    aws_api_gateway_method.video_id_options,
    aws_api_gateway_integration.video_id_options_integration,
    aws_api_gateway_method_response.video_id_options_response_200,
    aws_api_gateway_integration_response.video_id_options_integration_response_200,
    aws_api_gateway_integration.video_delete_integration,
    aws_api_gateway_method.video_delete,
    aws_api_gateway_authorizer.cognito_authorizer
  ]
  rest_api_id = aws_api_gateway_rest_api.safetube_api.id
  triggers = {
    redeployment = timestamp()
  }
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.deployment.id
  rest_api_id   = aws_api_gateway_rest_api.safetube_api.id
  stage_name    = "prod"
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_authorizer" "cognito_authorizer" {
  name            = "safetube-cognito-authorizer"
  rest_api_id     = aws_api_gateway_rest_api.safetube_api.id
  identity_source = "method.request.header.Authorization"
  type            = "COGNITO_USER_POOLS"
  provider_arns   = [aws_cognito_user_pool.safetube_user_pool.arn]
}