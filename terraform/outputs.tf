output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.api_server.id
}

output "security_group_id" {
  description = "ID of the Security Group"
  value       = aws_security_group.api_sg.id
}
