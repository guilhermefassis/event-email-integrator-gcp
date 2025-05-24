provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_project_service" "enable_services" {
  for_each = toset([
    "pubsub.googleapis.com",
    "cloudfunctions.googleapis.com",
    "cloudbuild.googleapis.com"
  ])
  project = var.project_id
  service = each.key
}

resource "google_pubsub_topic" "gmail_topic" {
  name = var.topic_name
}

resource "google_pubsub_topic_iam_member" "pubsub_to_function" {
  topic = google_pubsub_topic.gmail_topic.name
  role  = "roles/pubsub.publisher"
  member = "serviceAccount:service-${data.google_project.project.number}@gcp-sa-pubsub.iam.gserviceaccount.com"
  depends_on = [
    google_pubsub_topic.gmail_topic,
    google_project_service.enable_services, # Ensure services are enabled before setting IAM
    data.google_project.project
  ]
}

data "google_project" "project" {
  project_id = var.project_id
  depends_on = [google_project_service.enable_services] # Ensure services are enabled before fetching project data
}