variable "rapid_api_key" {
  description = "API key for RapidAPI"
  type        = string
  sensitive   = true
}

variable "aws_region" {
  description = "aws_region for the resources"
  type        = string
}

variable "RAPIDAPI_KEY_1" {
  description = "RapidAPI Key 1"
  type        = string
}

variable "RAPIDAPI_KEY_2" {
  description = "RapidAPI Key 2"
  type        = string
}

variable "RAPIDAPI_KEY_3" {
  description = "RapidAPI Key 3"
  type        = string
}

variable "RAPIDAPI_KEY_4" {
  description = "RapidAPI Key 4"
  type        = string
}

variable "supadata_api_key" {
  description = "Supadata API key for transcript generation"
  type        = string
  sensitive   = true
}
