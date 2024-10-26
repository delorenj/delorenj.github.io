Let me create a comprehensive guide for Pete to set up a self-hosted Git backup solution on his MacBook.

## Overview
- Estimated time: 45-60 minutes
- Skill level: Beginner
- Prerequisites: MacBook with internet connection
- Critical warning: Backup any existing data before proceeding

## Initial Setup: Docker Desktop

**Step 1: Install Docker Desktop**
1. **Download Docker Desktop**
   - Open your browser and go to Docker's website
   - Click "Download for Mac with Apple Chip" (for M1/M2/M3) or "Download for Mac with Intel Chip"[2]

2. **Install Docker Desktop**
   - Open the downloaded DMG file
   - Drag Docker icon to Applications folder
   - Launch Docker Desktop from Applications
   - Click "Accept" when prompted for service agreement
   - Choose "Use recommended settings" and provide your MacBook password[2]

*Success Indicator: You'll see the Docker whale icon in your menu bar*

## Installing Portainer

**Step 1: Create Portainer Volume**
```bash
docker volume create portainer_data
```

**Step 2: Deploy Portainer**
```bash
docker run -d -p 9000:9000 --name=portainer --restart=unless-stopped -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce
```

*Success Indicator: Portainer will be accessible at http://localhost:9000*[3]

## Setting Up Gitea

**Step 1: Create Project Directory**
```bash
mkdir ~/git-backup
cd ~/git-backup
```

**Step 2: Create Docker Compose File**
Create a file named `docker-compose.yml` with the following content:
```yaml
version: "3"
services:
  gitea:
    image: gitea/gitea:latest
    container_name: gitea
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - GITEA__database__DB_TYPE=sqlite3
    restart: unless-stopped
    volumes:
      - ./gitea:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "222:22"
```

**Step 3: Deploy Gitea**
```bash
docker-compose up -d
```

*Success Indicator: Gitea will be accessible at http://localhost:3000*[4]

## Backup Configuration

**Step 1: Create Backup Script**
Create a file named `backup-git.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/Users/peteturok/git-backups/$(date +%Y-%m-%d)"
CONTAINER_NAME="gitea"

# Create backup directory
mkdir -p $BACKUP_DIR

# Stop Gitea container
docker stop $CONTAINER_NAME

# Backup Gitea data
docker run --rm --volumes-from $CONTAINER_NAME -v $BACKUP_DIR:/backup alpine tar czf /backup/gitea-backup.tar.gz /data

# Start Gitea container
docker start $CONTAINER_NAME

echo "Backup completed at $BACKUP_DIR"
```

**Step 2: Setup Automated Backups**
Add to crontab:
```bash
0 0 * * * /Users/peteturok/git-backup/backup-git.sh
```

## Manual Backup Trigger
To manually trigger a backup:
```bash
chmod +x backup-git.sh
./backup-git.sh
```[7]

## Troubleshooting Section

**Common Issues:**
- **Docker Desktop won't start**: Ensure virtualization is enabled in BIOS
- **Ports already in use**: Change the port mappings in docker-compose.yml
- **Backup script fails**: Check directory permissions and ensure Docker is running

**If Something Goes Wrong:**
- Stop containers: `docker-compose down`
- Remove containers: `docker-compose down -v`
- Start fresh: `docker-compose up -d`

## Security Notes
- Change default admin password immediately after setup
- Keep Docker Desktop and Gitea updated
- Regularly verify backup integrity
- Store backups in multiple locations following 3-2-1 backup rule[5]

Citations:
[1] https://www.jenx.si/2019/10/25/how-to-host-your-private-git-service-inside-docker/
[2] https://www.youtube.com/watch?v=-EXlfSsP49A
[3] https://www.howtogeek.com/devops/how-to-get-started-with-portainer-a-web-ui-for-docker/
[4] https://easycode.page/gitea-a-self-hosted-private-git-server-on-docker/
[5] https://blog.pixelfreestudio.com/best-practices-for-backing-up-git-repositories/
[6] https://www.troydieter.com/post/github-backup/
[7] https://git.offen.dev/offen/docker-volume-backup/src/branch/main/docs/how-tos/manual-trigger.md
[8] https://www.reddit.com/r/selfhosted/comments/17stfbj/best_self_hosted_git_server/

