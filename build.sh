export GOOGLE_APPLICATION_CREDENTIALS="../keys/terraform-sa.json"
gcloud services enable cloudresourcemanager.googleapis.com --project=maps-project-test-444412
cd terraform
terraform init
terraform plan
terraform apply
