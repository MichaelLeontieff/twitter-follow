
# Create Redis VM
az vm create \
  --resource-group "Cloud-Computing" \
  --name "redis-cache" \
  --image "redis-image-revised" \
  --ssh-key-value @/Users/michaelleontieff/.ssh/id_rsa.pub \
  --custom-data "./invoke-redis-start-script.sh"