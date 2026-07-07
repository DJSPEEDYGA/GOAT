# 🚀 Hostinger Integration Guide

## Overview

The GOAT Royalty App now includes comprehensive Hostinger API integration, allowing you to manage your hosting infrastructure directly from the application. This integration provides automated domain management, SSL certificates, email accounts, databases, and more.

## 🔑 Features

### 1. Domain Management
- List all domains in your Hostinger account
- Get detailed domain information
- Manage DNS records (A, CNAME, MX, TXT, etc.)
- Check domain availability
- Automated DNS configuration

### 2. SSL Certificate Management
- View SSL certificate status
- Install SSL certificates automatically
- Monitor certificate expiration
- Automated renewal reminders

### 3. Email Management
- Create email accounts
- List all email accounts for a domain
- Delete email accounts
- Set mailbox quotas
- Manage email forwarding

### 4. Database Management
- List all databases
- Create new databases
- Manage database users
- Monitor database usage

### 5. FTP Management
- List FTP accounts
- Create new FTP accounts
- Set directory permissions
- Manage FTP access

### 6. Hosting Statistics
- Monitor bandwidth usage
- Track disk space usage
- View hosting performance metrics
- Get account information and limits

### 7. Autonomous Agent Integration
- 8 new AI agent tools for hosting automation
- Automated hosting management tasks
- Intelligent resource optimization
- Proactive monitoring and alerts

## 📋 Setup Instructions

### Step 1: Get Your Hostinger API Token

1. Log in to your Hostinger account
2. Navigate to API settings
3. Generate a new API token
4. Copy the token (it will look like: `u4WIezhO6K1Zv0ZXor4VMDHZNFzpKb3h0iNgdUpda243813a`)

### Step 2: Configure Environment Variables

Add your Hostinger API token to the `.env` file:

```bash
# Hostinger API Configuration
HOSTINGER_API_TOKEN=your-hostinger-api-token-here
```

### Step 3: Test the Connection

Use the test endpoint to verify your API connection:

```bash
curl -X GET http://localhost:5001/api/hostinger/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🛠️ API Endpoints

### Domain Management

#### List All Domains
```http
GET /api/hostinger/domains
Authorization: Bearer {jwt_token}
```

#### Get Domain Details
```http
GET /api/hostinger/domains/:domainName
Authorization: Bearer {jwt_token}
```

#### Get DNS Records
```http
GET /api/hostinger/domains/:domainName/dns
Authorization: Bearer {jwt_token}
```

#### Create DNS Record
```http
POST /api/hostinger/domains/:domainName/dns
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "type": "A",
  "name": "www",
  "value": "93.127.214.171",
  "ttl": 3600
}
```

#### Update DNS Record
```http
PUT /api/hostinger/domains/:domainName/dns/:recordId
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "type": "A",
  "name": "www",
  "value": "93.127.214.171",
  "ttl": 3600
}
```

#### Delete DNS Record
```http
DELETE /api/hostinger/domains/:domainName/dns/:recordId
Authorization: Bearer {jwt_token}
```

### SSL Management

#### Get SSL Information
```http
GET /api/hostinger/domains/:domainName/ssl
Authorization: Bearer {jwt_token}
```

#### Install SSL Certificate
```http
POST /api/hostinger/domains/:domainName/ssl
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "certificate": "-----BEGIN CERTIFICATE-----...",
  "private_key": "-----BEGIN PRIVATE KEY-----...",
  "ca_bundle": "-----BEGIN CERTIFICATE-----..."
}
```

### Email Management

#### List Email Accounts
```http
GET /api/hostinger/domains/:domainName/emails
Authorization: Bearer {jwt_token}
```

#### Create Email Account
```http
POST /api/hostinger/domains/:domainName/emails
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "username": "info",
  "password": "SecurePassword123!",
  "quota": 1024
}
```

#### Delete Email Account
```http
DELETE /api/hostinger/domains/:domainName/emails/:emailId
Authorization: Bearer {jwt_token}
```

### Hosting Statistics

#### Get Hosting Stats
```http
GET /api/hostinger/hosting/stats
Authorization: Bearer {jwt_token}
```

#### Get Bandwidth Usage
```http
GET /api/hostinger/hosting/bandwidth?start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer {jwt_token}
```

#### Get Disk Usage
```http
GET /api/hostinger/hosting/disk-usage
Authorization: Bearer {jwt_token}
```

### Database Management

#### List Databases
```http
GET /api/hostinger/databases
Authorization: Bearer {jwt_token}
```

#### Create Database
```http
POST /api/hostinger/databases
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "goat_royalty_db",
  "username": "goat_user",
  "password": "SecurePassword123!"
}
```

### FTP Management

#### List FTP Accounts
```http
GET /api/hostinger/ftp
Authorization: Bearer {jwt_token}
```

#### Create FTP Account
```http
POST /api/hostinger/ftp
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "username": "goat_ftp",
  "password": "SecurePassword123!",
  "directory": "/public_html"
}
```

## 🤖 Autonomous Agent Tools

The Hostinger integration includes 8 new tools for the autonomous agent:

### 1. manage_domain
Manage domain settings including DNS records and SSL certificates.

**Example Usage:**
```javascript
{
  "action": "add_dns",
  "domain_name": "example.com",
  "dns_data": {
    "type": "A",
    "name": "www",
    "value": "93.127.214.171",
    "ttl": 3600
  }
}
```

### 2. manage_ssl
Manage SSL certificates for domains.

**Example Usage:**
```javascript
{
  "action": "get_info",
  "domain_name": "example.com"
}
```

### 3. manage_email
Manage email accounts for domains.

**Example Usage:**
```javascript
{
  "action": "create",
  "domain_name": "example.com",
  "email_data": {
    "username": "support",
    "password": "SecurePassword123!",
    "quota": 2048
  }
}
```

### 4. get_hosting_stats
Get hosting statistics including bandwidth, disk usage, and performance metrics.

**Example Usage:**
```javascript
{
  "metric": "all",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```

### 5. manage_database
Manage databases on the hosting account.

**Example Usage:**
```javascript
{
  "action": "create",
  "database_data": {
    "name": "app_database",
    "username": "db_user",
    "password": "SecurePassword123!"
  }
}
```

### 6. manage_ftp
Manage FTP accounts for file transfers.

**Example Usage:**
```javascript
{
  "action": "create",
  "ftp_data": {
    "username": "ftp_user",
    "password": "SecurePassword123!",
    "directory": "/public_html/uploads"
  }
}
```

### 7. check_domain_availability
Check if a domain name is available for registration.

**Example Usage:**
```javascript
{
  "domain_name": "my-new-domain.com"
}
```

### 8. get_account_info
Get Hostinger account information and limits.

**Example Usage:**
```javascript
{}
```

## 🎯 Use Cases

### Automated Domain Setup
```javascript
// Agent can automatically set up a new domain
const task = "Set up example.com with www subdomain pointing to 93.127.214.171 and install SSL certificate";
await agent.execute(task);
```

### Email Account Management
```javascript
// Agent can create email accounts for new artists
const task = "Create email account artist@example.com with 5GB quota";
await agent.execute(task);
```

### Hosting Monitoring
```javascript
// Agent can monitor hosting resources
const task = "Check hosting disk usage and bandwidth for the last 30 days";
await agent.execute(task);
```

### Database Provisioning
```javascript
// Agent can create databases for new features
const task = "Create a new database called analytics_db with user analytics_user";
await agent.execute(task);
```

## 🔒 Security Best Practices

1. **API Token Security**
   - Never commit your API token to version control
   - Use environment variables for sensitive data
   - Rotate API tokens regularly
   - Limit API token permissions to necessary operations

2. **Access Control**
   - All Hostinger endpoints require authentication
   - Only admin users can access Hostinger management features
   - Use JWT tokens with appropriate expiration times

3. **Rate Limiting**
   - Hostinger API has rate limits
   - The service includes automatic retry logic
   - Monitor API usage to avoid hitting limits

4. **Error Handling**
   - All API calls include comprehensive error handling
   - Errors are logged for debugging
   - User-friendly error messages are returned

## 📊 Monitoring and Logging

### Enable Detailed Logging
```javascript
// In your .env file
LOG_LEVEL=debug
```

### Monitor API Usage
```javascript
// Check Hostinger API usage
const stats = await hostingerService.getAccountInfo();
console.log('API calls remaining:', stats.data.api_calls_remaining);
```

## 🚨 Troubleshooting

### Connection Issues
```bash
# Test API connection
curl -X GET http://localhost:5001/api/hostinger/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Invalid API Token
- Verify your API token is correct in `.env`
- Check if the token has expired
- Regenerate token in Hostinger dashboard

### Rate Limit Errors
- Wait before retrying requests
- Implement exponential backoff
- Monitor API usage limits

### DNS Propagation
- DNS changes can take 24-48 hours to propagate
- Use DNS checker tools to verify changes
- Clear local DNS cache if needed

## 📚 Additional Resources

- [Hostinger API Documentation](https://api.hostinger.com/docs)
- [DNS Record Types](https://en.wikipedia.org/wiki/List_of_DNS_record_types)
- [SSL Certificate Guide](https://www.hostinger.com/tutorials/ssl-certificate)
- [Email Configuration](https://www.hostinger.com/tutorials/email)

## 🆘 Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/DJSPEEDYGA/GOAT-Royalty-App/issues)
- Contact Hostinger Support
- Review the autonomous agent logs

## 📝 License

This integration is part of the GOAT Royalty App and follows the same license terms.

---

**Last Updated:** December 2, 2024
**Version:** 1.0.0
**Status:** Production Ready ✅