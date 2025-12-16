output "postgres_endpoint" {
  description = "PostgreSQL database endpoint"
  value       = aws_db_instance.smartx_postgres.endpoint
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = aws_elasticache_cluster.smartx_redis.cache_nodes[0].address
}

output "s3_bucket_name" {
  description = "S3 bucket name for uploads"
  value       = aws_s3_bucket.smartx_uploads.bucket
}

output "api_gateway_url" {
  description = "API Gateway URL"
  value       = aws_apigatewayv2_api.smartx_api.api_endpoint
}

output "cloudfront_url" {
  description = "CloudFront distribution URL"
  value       = aws_cloudfront_distribution.smartx_cdn.domain_name
}

output "ecs_cluster_name" {
  description = "ECS cluster name for workers"
  value       = aws_ecs_cluster.smartx_workers.name
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.smartx.id
}

output "private_subnets" {
  description = "Private subnet IDs"
  value       = [aws_subnet.private_a.id, aws_subnet.private_b.id]
}

output "public_subnets" {
  description = "Public subnet IDs"
  value       = [aws_subnet.public_a.id, aws_subnet.public_b.id]
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.smartx_logs.name
}

output "db_security_group_id" {
  description = "Database security group ID"
  value       = aws_security_group.db.id
}

output "cache_security_group_id" {
  description = "Cache security group ID"
  value       = aws_security_group.cache.id
}

output "api_security_group_id" {
  description = "API security group ID"
  value       = aws_security_group.api.id
}
