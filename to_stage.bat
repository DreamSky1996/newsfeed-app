call python version.py

call npm run-script build

call gcloud auth activate-service-account --key-file=.\app-deployer-service-account.json

call gcloud config set project newsfeed-stage

echo () | gcloud app deploy