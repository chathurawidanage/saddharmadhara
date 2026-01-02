# Podcast Sync Service

This service automates the creation and maintenance of a podcast RSS feed from a YouTube channel. It fetches videos, converts them to MP3, uploads them (along with thumbnails) to an S3-compatible storage (like MinIO), and updates an RSS feed compliant with Spotify and Apple Podcasts.

## Features

- **YouTube to Podcast**: Automatically converts YouTube videos to audio-only podcasts.
- **S3 Integration**: Stores audio files, thumbnails, and the `podcast.xml` RSS feed in S3/MinIO.
- **Smart Sync**: Skips videos that have already been processed to save bandwidth and time.
- **Metadata Management**: Configurable podcast details (title, author, category, etc.) via environment variables.
- **HTTP API**: Includes a Flask server to trigger synchronization via webhooks or cron jobs.
- **Dockerized**: Ready for deployment on platforms like Coolify.

## Configuration

Create a `.env` file in this directory with the following variables:

### S3 / MinIO Configuration

```env
S3_BUCKET=your-bucket-name
S3_ENDPOINT_URL=https://your-minio-url
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### YouTube Configuration

```env
YOUTUBE_CHANNEL_URL=https://www.youtube.com/channel/YOUR_CHANNEL_ID/videos
```

### Podcast Metadata

```env
PODCAST_TITLE=My Podcast
PODCAST_DESCRIPTION=A description of your podcast.
PODCAST_LINK=https://your-website.com
PODCAST_AUTHOR=Author Name
PODCAST_EMAIL=email@example.com
PODCAST_LANGUAGE=en
PODCAST_CATEGORY=Category (e.g., Religion & Spirituality)
PODCAST_SUBCATEGORY=Subcategory (e.g., Buddhism)
PODCAST_IMAGE_URL=https://link-to-your-podcast-cover.jpg
PODCAST_EXPLICIT=no
```

## Running Locally

1. **Install Dependencies**:
    You need `ffmpeg` installed on your system.

    ```bash
    brew install ffmpeg  # macOS
    pip install -r requirements.txt
    ```

2. **Run Sync Script**:
    Run the synchronization logic once:

    ```bash
    python sync.py
    ```

3. **Run HTTP Server**:
    Start the API server to trigger syncs on demand:

    ```bash
    python server.py
    ```

    - Health check: `http://localhost:8080/health`
    - Trigger Sync: `http://localhost:8080/sync`

## Deployment (Docker / Coolify)

The service includes a `Dockerfile` for easy deployment.

1. **Build & Run**:

    ```bash
    docker build -t podcast-sync .
    docker run -p 8080:8080 --env-file .env podcast-sync
    ```

2. **Coolify**:
    - Deploy as an **Application** using the `Dockerfile`.
    - Add all environment variables in the Coolify dashboard.
    - Set the **Health Check** path to `/health`.
    - Use Coolify's **Scheduler** (or an external cron) to hit the `/sync` endpoint periodically (e.g., every hour).

## API Endpoints

- `GET /health`: Returns `200 OK` if the server is running.
- `POST/GET /sync`: Triggers the synchronization process. This is a **synchronous (blocking)** call. It waits for the sync to finish before returning. Set your client timeout appropriately (e.g., 1 hour).
