variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "db_password" {
  description = "PostgreSQL database password"
  type        = string
  sensitive   = true
  default     = "postgres"
}

variable "redis_password" {
  description = "Redis password"
  type        = string
  sensitive   = true
  default     = ""
}

variable "llm_api_key" {
  description = "LLM API key for AI services"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
}

variable "minio_access_key" {
  description = "MinIO access key"
  type        = string
  sensitive   = true
  default     = "minioadmin"
}

variable "minio_secret_key" {
  description = "MinIO secret key"
  type        = string
  sensitive   = true
  default     = "minioadmin"
}

variable "instance_sizes" {
  description = "Instance sizes for different environments"
  type = object({
    dev = object({
      db_instance_class    = string
      redis_node_type      = string
      worker_instance_type = string
    })
    staging = object({
      db_instance_class    = string
      redis_node_type      = string
      worker_instance_type = string
    })
    prod = object({
      db_instance_class    = string
      redis_node_type      = string
      worker_instance_type = string
    })
  })
  default = {
    dev = {
      db_instance_class    = "db.t3.micro"
      redis_node_type      = "cache.t3.micro"
      worker_instance_type = "t3.micro"
    }
    staging = {
      db_instance_class    = "db.t3.small"
      redis_node_type      = "cache.t3.small"
      worker_instance_type = "t3.small"
    }
    prod = {
      db_instance_class    = "db.m5.large"
      redis_node_type      = "cache.m5.large"
      worker_instance_type = "m5.large"
    }
  }
}

variable "scaling_config" {
  description = "Auto-scaling configuration"
  type = object({
    min_workers = number
    max_workers = number
    desired_workers = number
  })
  default = {
    min_workers     = 1
    max_workers     = 5
    desired_workers = 2
  }
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS"
  type        = string
  default     = ""
}
