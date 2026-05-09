#!/bin/bash

# Configuration
BACKUP_DIR="/home/vedantchaudhary/projects/creatorhub/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Starting backup at $TIMESTAMP..."

# Run mongodump inside the container
# We use 'mongodb' as the service name from docker-compose
docker compose exec -t mongodb mongodump --archive --gzip > "$BACKUP_DIR/db_backup_$TIMESTAMP.gz"

if [ $? -eq 0 ]; then
  echo "Backup successful: $BACKUP_DIR/db_backup_$TIMESTAMP.gz"
else
  echo "Backup failed!"
  exit 1
fi

# Remove old backups
find $BACKUP_DIR -type f -name "*.gz" -mtime +$RETENTION_DAYS -exec rm {} \;

echo "Old backups cleaned up."
