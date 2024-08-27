# Build

```shell
DOCKER_DEFAULT_PLATFORM=linux/amd64 docker build -t glauberportella/fingerprint-backend:latest .
```

```shell
docker push glauberportella/fingerprint-backend:latest
```

# Cloud Run

```shell
gcloud run deploy fingerprint-backend \
  --image=docker.io/glauberportella/fingerprint-backend:latest \
  --region=southamerica-east1 \
  --concurrency=10 \
  --min-instances=0 \
  --max-instances=3 \
  --platform=managed \
  --service-account=fingerprint-backend@carsecurity-app.iam.gserviceaccount.com \
  --cpu=1 \
  --memory=512Mi \
  --port=3000 \
  --allow-unauthenticated \
  --execution-environment=gen2
```
