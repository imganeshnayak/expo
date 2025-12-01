# Backend API Testing Script
Write-Host "=================================="
Write-Host "UMA Backend API Testing"
Write-Host "=================================="
Write-Host ""

$baseUrl = "http://localhost:5000"
$token = ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..."
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "[PASS] Health Check: $($health.status)"
} catch {
    Write-Host "[FAIL] Health Check Failed"
}
Write-Host ""

# Test 2: Merchant Registration/Login
Write-Host "2. Testing Merchant Authentication..."
try {
    $registerBody = @{
        email = "test@merchant.com"
        password = "password123"
        businessName = "Test Coffee Shop"
        name = "John Doe"
        phone = "+1234567890"
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/merchant/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body $registerBody
    $token = $registerResponse.token
    Write-Host "[PASS] Merchant Registered: $($registerResponse.user.businessName)"
} catch {
    # Try login if already exists
    try {
        $loginBody = @{
            email = "test@merchant.com"
            password = "password123"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/merchant/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
        $token = $loginResponse.token
        Write-Host "[PASS] Logged in: $($loginResponse.user.businessName)"
    } catch {
        Write-Host "[FAIL] Authentication failed"
        exit
    }
}
Write-Host ""

# Test 3: Get Profile
Write-Host "3. Testing Get Merchant Profile..."
try {
    $profile = Invoke-RestMethod -Uri "$baseUrl/api/merchant/auth/profile" -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Host "[PASS] Profile: $($profile.user.profile.name) - $($profile.user.merchant.name)"
} catch {
    Write-Host "[FAIL] Get Profile Failed"
}
Write-Host ""

# Test 4: Customer Stats
Write-Host "4. Testing CRM - Customer Stats..."
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/api/crm/customers/stats" -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Host "[PASS] Total Customers: $($stats.stats.totalCustomers), VIP: $($stats.stats.vipCustomers)"
} catch {
    Write-Host "[FAIL] Customer Stats Failed"
}
Write-Host ""

# Test 5: List Customers
Write-Host "5. Testing CRM - List Customers..."
try {
    $customers = Invoke-RestMethod -Uri "$baseUrl/api/crm/customers?limit=5" -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Host "[PASS] Retrieved $($customers.customers.Count) customers"
} catch {
    Write-Host "[FAIL] List Customers Failed"
}
Write-Host ""

# Test 6: Create Campaign
Write-Host "6. Testing Create Campaign..."
try {
    $campaignBody = @{
        name = "Weekend Special"
        type = "acquisition"
        status = "active"
        budget = @{
            total = 5000
            spent = 0
        }
        targeting = @{
            audience = "all"
            timing = "always"
        }
        offer = @{
            discountPercent = 20
        }
    } | ConvertTo-Json -Depth 10

    $campaign = Invoke-RestMethod -Uri "$baseUrl/api/campaigns" -Method POST -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} -Body $campaignBody
    Write-Host "[PASS] Campaign Created: $($campaign.campaign.name)"
} catch {
    Write-Host "[FAIL] Create Campaign Failed"
}
Write-Host ""

# Test 7: List Campaigns
Write-Host "7. Testing List Campaigns..."
try {
    $campaigns = Invoke-RestMethod -Uri "$baseUrl/api/campaigns" -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Host "[PASS] Retrieved $($campaigns.campaigns.Count) campaigns"
} catch {
    Write-Host "[FAIL] List Campaigns Failed"
}
Write-Host ""

# Test 8: Analytics Overview
Write-Host "8. Testing Analytics Overview..."
try {
    $analytics = Invoke-RestMethod -Uri "$baseUrl/api/analytics/overview?period=week" -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Host "[PASS] Analytics Retrieved"
    if ($analytics.analytics) {
        Write-Host "  Revenue: $($analytics.analytics.metrics.totalRevenue), Customers: $($analytics.analytics.metrics.totalCustomers)"
    }
} catch {
    Write-Host "[FAIL] Analytics Failed"
}
Write-Host ""

# Test 9: Customer Insights
Write-Host "9. Testing Customer Insights..."
try {
    $insights = Invoke-RestMethod -Uri "$baseUrl/api/analytics/customers" -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Host "[PASS] Total: $($insights.insights.totalCustomers), VIP: $($insights.insights.segments.vip)"
} catch {
    Write-Host "[FAIL] Customer Insights Failed"
}
Write-Host ""

# Test 10: Notifications
Write-Host "10. Testing Notifications..."
try {
    $notifications = Invoke-RestMethod -Uri "$baseUrl/api/notifications?limit=10" -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Host "[PASS] Retrieved $($notifications.notifications.Count) notifications, Unread: $($notifications.unreadCount)"
} catch {
    Write-Host "[FAIL] Notifications Failed"
}
Write-Host ""

Write-Host "=================================="
Write-Host "Testing Complete!"
Write-Host "=================================="
