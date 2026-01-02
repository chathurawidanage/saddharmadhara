import yt_dlp
import boto3
import os
import json
import xml.etree.ElementTree as ET
from dotenv import load_dotenv
import email.utils
from datetime import datetime

from botocore.exceptions import ClientError

load_dotenv()

# --- CONFIGURATION ---
S3_BUCKET = os.getenv("S3_BUCKET")
S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# Podcast Metadata
# Podcast Metadata
PODCAST_TITLE = os.getenv("PODCAST_TITLE")
PODCAST_DESCRIPTION = os.getenv("PODCAST_DESCRIPTION")
PODCAST_LINK = os.getenv("PODCAST_LINK")
PODCAST_AUTHOR = os.getenv("PODCAST_AUTHOR")
PODCAST_LANGUAGE = os.getenv("PODCAST_LANGUAGE")
PODCAST_CATEGORY = os.getenv("PODCAST_CATEGORY")
PODCAST_SUBCATEGORY = os.getenv("PODCAST_SUBCATEGORY")
PODCAST_IMAGE_URL = os.getenv("PODCAST_IMAGE_URL")
PODCAST_EXPLICIT = os.getenv("PODCAST_EXPLICIT")
PODCAST_EPISODE_DESCRIPTION = os.getenv("PODCAST_EPISODE_DESCRIPTION")
PODCAST_EMAIL = os.getenv("PODCAST_EMAIL")

required_podcast_vars = [
    ("PODCAST_TITLE", PODCAST_TITLE),
    ("PODCAST_DESCRIPTION", PODCAST_DESCRIPTION),
    ("PODCAST_LINK", PODCAST_LINK),
    ("PODCAST_AUTHOR", PODCAST_AUTHOR),
    ("PODCAST_LANGUAGE", PODCAST_LANGUAGE),
    ("PODCAST_CATEGORY", PODCAST_CATEGORY),
    ("PODCAST_SUBCATEGORY", PODCAST_SUBCATEGORY),
    ("PODCAST_IMAGE_URL", PODCAST_IMAGE_URL),
    ("PODCAST_EXPLICIT", PODCAST_EXPLICIT),
    ("PODCAST_EPISODE_DESCRIPTION", PODCAST_EPISODE_DESCRIPTION),
    ("PODCAST_EMAIL", PODCAST_EMAIL),
]

missing_vars = [name for name, value in required_podcast_vars if not value]
if missing_vars:
    print(f"Error: Missing required environment variables: {', '.join(missing_vars)}")
    exit(1)

if not S3_BUCKET:
    print("Error: S3_BUCKET not set in .env")
    exit(1)


if not S3_ENDPOINT_URL:
    print("Warning: S3_ENDPOINT_URL not set in .env")

# Initialize S3 client
s3_client = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT_URL,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)


def download_and_upload(video_url):
    # 1. Download Options
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": "%(id)s.%(ext)s",  # Name file as VideoID.mp3
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ],
    }

    filename = None
    metadata_filename = None
    title = "No Title"
    description = ""
    duration = 0
    file_size = 0
    pub_date = ""

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            video_id = info["id"]
            filename = f"{video_id}.mp3"
            metadata_filename = f"{video_id}.json"
            title = info.get("title", "No Title")
            description = PODCAST_EPISODE_DESCRIPTION
            upload_date_str = info.get("upload_date", "")
            duration = info.get("duration", 0)

            # Format PubDate (RFC 2822)
            if upload_date_str:
                try:
                    dt = datetime.strptime(upload_date_str, "%Y%m%d")
                    pub_date = email.utils.format_datetime(dt)
                except ValueError:
                    pub_date = email.utils.formatdate(usegmt=True)
            else:
                pub_date = email.utils.formatdate(usegmt=True)

        if filename and os.path.exists(filename):
            # Get file size
            file_size = os.path.getsize(filename)

            # 2. Upload Audio to S3
            print(f"Uploading {filename} to S3...")
            s3_client.upload_file(
                filename, S3_BUCKET, filename, ExtraArgs={"ContentType": "audio/mpeg"}
            )

            # 3. Generate Public URL
            base_url = f"{S3_ENDPOINT_URL}/{S3_BUCKET}"
            s3_url = f"{base_url}/{filename}"

            # 4. Upload Metadata to S3
            metadata = {
                "id": video_id,
                "title": title,
                "description": description,
                "original_url": video_url,
                "s3_audio_url": s3_url,
                "upload_date": upload_date_str,
                "duration": duration,
                "pub_date": pub_date,
                "length_bytes": file_size,
            }

            print(f"Uploading {metadata_filename} to S3...")
            with open(metadata_filename, "w", encoding="utf-8") as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)

            s3_client.upload_file(
                metadata_filename,
                S3_BUCKET,
                metadata_filename,
                ExtraArgs={"ContentType": "application/json"},
            )

            return {
                "title": title,
                "url": s3_url,
                "description": description,
                "duration": duration,
                "length_bytes": file_size,
                "pub_date": pub_date,
            }
        else:
            print(f"Expected file {filename} not found after download.")
            return None

    finally:
        # Clean up local files
        if filename and os.path.exists(filename):
            try:
                os.remove(filename)
                print(f"Deleted local file: {filename}")
            except OSError as e:
                print(f"Error removing {filename}: {e}")

        if metadata_filename and os.path.exists(metadata_filename):
            try:
                os.remove(metadata_filename)
                print(f"Deleted local file: {metadata_filename}")
            except OSError as e:
                print(f"Error removing {metadata_filename}: {e}")


def format_duration(seconds):
    """Converts seconds to HH:MM:SS or MM:SS format."""
    if not seconds:
        return "00:00"
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    if h > 0:
        return f"{h:02d}:{m:02d}:{s:02d}"
    else:
        return f"{m:02d}:{s:02d}"


def generate_rss(items):
    local_filename = "podcast.xml"

    # Register namespaces
    ET.register_namespace("itunes", "http://www.itunes.com/dtds/podcast-1.0.dtd")

    # 1. Download existing or create new
    try:
        s3_client.download_file(S3_BUCKET, local_filename, local_filename)
        tree = ET.parse(local_filename)
        root = tree.getroot()
        channel = root.find("channel")
        print("Downloaded existing podcast.xml")
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        if error_code == "404" or error_code == "NoSuchKey":
            print("No existing podcast.xml found. Creating new.")
            root = ET.Element("rss")
            root.set("version", "2.0")
            channel = ET.SubElement(root, "channel")
            tree = ET.ElementTree(root)
        else:
            print(f"Error downloading podcast.xml: {e}")
            raise e
    except Exception as e:
        print(f"Error parsing existing podcast.xml: {e}")
        raise e

    # --- Update Channel Metadata (Always sync with .env) ---
    def update_tag(parent, tag, text=None, attrib=None):
        el = parent.find(tag)
        if el is None:
            el = ET.SubElement(parent, tag)
        if text is not None:
            el.text = text
        if attrib:
            for k, v in attrib.items():
                el.set(k, v)
        return el

    # Standard Tags
    update_tag(channel, "title", PODCAST_TITLE)
    update_tag(channel, "description", PODCAST_DESCRIPTION)
    update_tag(channel, "link", PODCAST_LINK)
    update_tag(channel, "language", PODCAST_LANGUAGE)

    # iTunes Tags
    update_tag(
        channel, "{http://www.itunes.com/dtds/podcast-1.0.dtd}author", PODCAST_AUTHOR
    )
    update_tag(
        channel,
        "{http://www.itunes.com/dtds/podcast-1.0.dtd}explicit",
        PODCAST_EXPLICIT,
    )

    # iTunes Owner (Complex Type - Remove and Recreate to be safe)
    owner_tag = "{http://www.itunes.com/dtds/podcast-1.0.dtd}owner"
    existing_owner = channel.find(owner_tag)
    if existing_owner is not None:
        channel.remove(existing_owner)

    owner = ET.SubElement(channel, owner_tag)
    ET.SubElement(
        owner, "{http://www.itunes.com/dtds/podcast-1.0.dtd}name"
    ).text = PODCAST_AUTHOR
    ET.SubElement(
        owner, "{http://www.itunes.com/dtds/podcast-1.0.dtd}email"
    ).text = PODCAST_EMAIL

    # iTunes Category (Complex Type - Remove and Recreate)
    cat_tag = "{http://www.itunes.com/dtds/podcast-1.0.dtd}category"
    for cat in channel.findall(cat_tag):
        channel.remove(cat)

    category = ET.SubElement(channel, cat_tag)
    category.set("text", PODCAST_CATEGORY)
    ET.SubElement(category, cat_tag).set("text", PODCAST_SUBCATEGORY)

    # iTunes Image
    img_tag = "{http://www.itunes.com/dtds/podcast-1.0.dtd}image"
    update_tag(channel, img_tag, attrib={"href": PODCAST_IMAGE_URL})

    # 2. Identify insertion point (after channel details, before first item)
    insert_index = -1
    existing_guids = set()

    # Scan for existing items and insertion point
    for i, child in enumerate(channel):
        if child.tag == "item":
            if insert_index == -1:
                insert_index = i
            guid = child.find("guid")
            if guid is not None:
                existing_guids.add(guid.text)

    if insert_index == -1:
        insert_index = len(channel)

    # 3. Add new items
    for item in items:
        if item["url"] in existing_guids:
            print(f"Item already in RSS, skipping: {item['title']}")
            continue

        print(f"Adding to RSS: {item['title']}")
        rss_item = ET.Element("item")
        ET.SubElement(rss_item, "title").text = item["title"]
        ET.SubElement(rss_item, "description").text = item["description"]

        enclosure = ET.SubElement(rss_item, "enclosure")
        enclosure.set("url", item["url"])
        enclosure.set("type", "audio/mpeg")
        enclosure.set("length", str(item.get("length_bytes", 0)))

        ET.SubElement(rss_item, "guid").text = item["url"]

        # Spotify/iTunes Tags
        ET.SubElement(rss_item, "pubDate").text = item.get("pub_date", "")
        ET.SubElement(
            rss_item, "{http://www.itunes.com/dtds/podcast-1.0.dtd}duration"
        ).text = format_duration(item.get("duration", 0))
        ET.SubElement(
            rss_item, "{http://www.itunes.com/dtds/podcast-1.0.dtd}explicit"
        ).text = "no"

        # Insert at the calculated index and increment to maintain order of new batch
        channel.insert(insert_index, rss_item)
        insert_index += 1

    # 4. Write and Upload
    tree.write(local_filename, encoding="UTF-8", xml_declaration=True)

    try:
        s3_client.upload_file(
            local_filename,
            S3_BUCKET,
            local_filename,
            ExtraArgs={"ContentType": "application/xml"},
        )
        print("Podcast RSS updated and uploaded.")
    except Exception as e:
        print(f"Error uploading podcast.xml: {e}")
    finally:
        # Clean up local file
        if os.path.exists(local_filename):
            os.remove(local_filename)


# --- EXECUTION ---


def check_if_exists(video_id):
    try:
        s3_client.head_object(Bucket=S3_BUCKET, Key=f"{video_id}.json")
        return True
    except ClientError as e:
        if e.response["Error"]["Code"] == "404":
            return False
        # For other errors, re-raise or logging
        print(f"Error checking if file exists: {e}")
        return False


def get_channel_videos_yt_dlp(channel_url):
    ydl_opts = {
        "extract_flat": True,
        "quiet": True,
        "ignoreerrors": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            print(f"DEBUG: Extracting info for {channel_url}")
            info = ydl.extract_info(channel_url, download=False)
            if "entries" in info:
                for entry in info["entries"]:
                    if entry and "id" in entry:
                        video_id = entry["id"]
                        # Filter out non-video entries (checking ID length > 11 as heuristic)
                        if len(video_id) > 11:
                            continue

                        video_url = entry.get("url")
                        if not video_url:
                            video_url = f"https://www.youtube.com/watch?v={video_id}"
                        yield {"id": video_id, "url": video_url}
            else:
                return
        except Exception as e:
            print(f"Error fetching channel videos: {e}")
            return


# --- TASKS ---


def get_video_items_task(channel_url):
    """Task: Fetch video items from Channel URL using yt-dlp."""
    print(f"Fetching videos from {channel_url}...")
    return get_channel_videos_yt_dlp(channel_url)


def process_video_task(video_item):
    """Task: Process a single video item (check, download, upload)."""
    video_id = video_item["id"]
    url = video_item["url"]

    if check_if_exists(video_id):
        print(f"Skipping {video_id} (already exists).")
        return None

    try:
        print(f"Processing {video_id}...")
        return download_and_upload(url)
    except Exception as e:
        print(f"Failed to process {url}: {e}")
        return None


def update_rss_feed_task(processed_items):
    """Task: Update and upload the podcast RSS feed."""
    print("Updating RSS feed metadata and content...")
    generate_rss(processed_items or [])


# --- WORKFLOW ---


def run_sync_workflow():
    channel_url = os.getenv("YOUTUBE_CHANNEL_URL")
    if not channel_url:
        print("Error: YOUTUBE_CHANNEL_URL not set in .env")
        return

    # 1. Get items
    video_items = get_video_items_task(channel_url)

    processed_items = []

    # 2. Process items (Limit to 1 per execution as requested)
    for item in video_items:
        result = process_video_task(item)
        if result:
            processed_items.append(result)
            if len(processed_items) >= 1:
                break

    # 3. Update Feed
    update_rss_feed_task(processed_items)


if __name__ == "__main__":
    run_sync_workflow()
