call npm run-script build

call gcloud auth activate-service-account --key-file=.\app-deployer-service-account.json

echo () gcloud app deploy