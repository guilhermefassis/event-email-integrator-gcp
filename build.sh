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


##########################################################################
########################DEPLOY CONSUMER###################################

gcloud functions deploy forwardToMake \
  --runtime=nodejs22 \
  --trigger-topic=gmail-inbox-topic \
  --entry-point=forwardToMake \
  --region=us-central1 \
  --set-env-vars=MAKE_WEBHOOK_URL=https://hook.eu2.make.com/ig1vx0kby64cxqkr4vkyek209emc2e6m \
  --memory=256MB \
  --timeout=60s \
  --allow-unauthenticated
