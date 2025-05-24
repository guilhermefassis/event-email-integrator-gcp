variable "project_id" {
    description = "Project ID on GCP"
    type        = string
}

variable "region" {
    description = "GCP Region"
    type        = string
    default     = "us-central1"
}

variable "topic_name" {
    description = "Pub/Sub topic name"
    type        = string
}

variable "function_email" {
    description = "Email that recive pub sub"
    type        = string
}