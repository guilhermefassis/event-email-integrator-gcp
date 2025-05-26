export GOOGLE_APPLICATION_CREDENTIALS="../keys/terraform-sa.json"
gcloud services enable cloudresourcemanager.googleapis.com --project=$project

########################################################################

#####################INSTANCES GOOGLE SERVICES##########################

cd terraform
terraform init
terraform plan
terraform apply
cd ../gmail-publisher

########################################################################

#####################DEPLOY GMAIL PUBLISHER#############################

gcloud functions deploy gmail-publisher   
        --gen2   
        --runtime=nodejs22   
        --region=us-central1   
        --entry-point=processEmail   
        --trigger-http   
        --allow-unauthenticated   
        --source=.    
        --set-env-vars="PUBSUB_TOPIC=$topic,GCP_PROJECT=$project"
