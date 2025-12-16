terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

provider "docker" {
  host = "unix:///var/run/docker.sock"
}

# S3 Bucket for file storage
resource "aws_s3_bucket" "smartx_uploads" {
  bucket = "smartx-uploads-${terraform.workspace}"
  force_destroy = true

  tags = {
    Name        = "SmartX Uploads"
    Environment = terraform.workspace
  }
}

# RDS PostgreSQL Database
resource "aws_db_instance" "smartx_postgres" {
  identifier             = "smartx-postgres-${terraform.workspace}"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  max_allocated_storage  = 100
  storage_type           = "gp2"
  db_name                = "smartx"
  username               = "postgres"
  password               = "postgres"
  publicly_accessible    = false
  skip_final_snapshot    = true
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.smartx.name

  tags = {
    Name        = "SmartX PostgreSQL"
    Environment = terraform.workspace
  }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "smartx_redis" {
  cluster_id           = "smartx-redis-${terraform.workspace}"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.0"
  port                 = 6379
  security_group_ids   = [aws_security_group.cache.id]
}

# ECS Cluster for workers
resource "aws_ecs_cluster" "smartx_workers" {
  name = "smartx-workers-${terraform.workspace}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "SmartX Workers"
    Environment = terraform.workspace
  }
}

# API Gateway
resource "aws_apigatewayv2_api" "smartx_api" {
  name          = "smartx-api-${terraform.workspace}"
  protocol_type = "HTTP"
}

# CloudFront CDN
resource "aws_cloudfront_distribution" "smartx_cdn" {
  enabled             = true
  default_root_object = "index.html"

  origin {
    domain_name = aws_s3_bucket.smartx_uploads.bucket_regional_domain_name
    origin_id   = "s3-origin"
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3-origin"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# Monitoring and Logging
resource "aws_cloudwatch_log_group" "smartx_logs" {
  name = "/smartx/${terraform.workspace}"
  retention_in_days = 30
}

# Security Groups
resource "aws_security_group" "db" {
  name        = "smartx-db-sg-${terraform.workspace}"
  description = "Security group for SmartX database"
}

resource "aws_security_group" "cache" {
  name        = "smartx-cache-sg-${terraform.workspace}"
  description = "Security group for SmartX cache"
}

resource "aws_security_group" "api" {
  name        = "smartx-api-sg-${terraform.workspace}"
  description = "Security group for SmartX API"
}

# VPC and Networking
resource "aws_vpc" "smartx" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name        = "SmartX VPC"
    Environment = terraform.workspace
  }
}

resource "aws_db_subnet_group" "smartx" {
  name       = "smartx-db-subnet-group"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]

  tags = {
    Name        = "SmartX DB Subnet Group"
    Environment = terraform.workspace
  }
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.smartx.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.smartx.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1b"
}

resource "aws_subnet" "public_a" {
  vpc_id            = aws_vpc.smartx.id
  cidr_block        = "10.0.101.0/24"
  availability_zone = "us-east-1a"
}

resource "aws_subnet" "public_b" {
  vpc_id            = aws_vpc.smartx.id
  cidr_block        = "10.0.102.0/24"
  availability_zone = "us-east-1b"
}
