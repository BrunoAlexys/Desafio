# Data source for AMI (Simulated in LocalStack)
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# Security Group
resource "aws_security_group" "api_sg" {
  name        = "api_sg"
  description = "Security group for the API"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS access"
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "API access"
  }

  #trivy:ignore:AVD-AWS-0104
  #tfsec:ignore:aws-vpc-no-public-egress-sgr
  # Permitimos egress para a internet, pois a API pode precisar baixar pacotes ou comunicar com serviços externos
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "API Security Group"
    Environment = "Dev"
  }
}

# EC2 Instance
resource "aws_instance" "api_server" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type
  
  vpc_security_group_ids = [aws_security_group.api_sg.id]

  tags = {
    Name        = "API Server"
    Environment = "Dev"
  }

  metadata_options {
    http_tokens = "required"
  }

  root_block_device {
    encrypted = true
  }
}
