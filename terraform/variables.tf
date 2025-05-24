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

variable "function_name" {
    description = "Cloud function Name"
    type        = string
}


variable "entry_point" {
    description = "Cloud Function Entry Point"
    type        = string
}

variable "source_dir" {
    description = "Source directory that function exists"
    type        = string

}