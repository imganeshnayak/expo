$body = @{
    email = "test@business.com"
    password = "test123"
    businessName = "Test Business"
    name = "Test User"
    phone = "+919999999999"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/merchant/auth/register" -Method POST -Body $body -ContentType "application/json"
$response | ConvertTo-Json -Depth 10
