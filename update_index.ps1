$filePath = "c:\Users\User\Desktop\u\frontend\app\(tabs)\index.tsx"
$content = Get-Content $filePath -Raw

# Remove AI badge, keep only notification bell
$content = $content -replace '(?s)(\s+<TouchableOpacity style=\{styles\.aiBadge\}[^>]*>.*?</TouchableOpacity>\r?\n)', ''

# Simplify greeting
$content = $content -replace '(?s)(<View style=\{styles\.greetingContainer\}>)\r?\n\s+<Text style=\{styles\.greetingSub\}>Good Morning,</Text>\r?\n\s+<Text style=\{styles\.greetingMain\}>Alex</Text>', '$1`r`n        <Text style={styles.greetingMain}>Discover Deals</Text>'

# Remove empty View after XPBar
$content = $content -replace '(?s)(<XPBar />\r?\n)\s+<View>\r?\n\s+</View>', '$1'

# Remove AI recommendation banner
$content = $content -replace '(?s)\s+{/\* AI Recommendation - Sleek Version \*/}\r?\n\s+<LockedFeatureOverlay[^>]*>.*?</LockedFeatureOverlay>\r?\n', ''

# Simplify widgets area
$content = $content -replace '(?s)(\s+{/\* Dynamic Widgets Area \*/}\r?\n\s+)<View style=\{styles\.widgetsArea\}>\r?\n\s+\{activeRide && <ActiveRideWidget />\}', '$1{activeRide && (`r`n            <View style={styles.widgetsArea}>`r`n              <ActiveRideWidget />`r`n            </View>`r`n          )}'

# Remove stats dashboard
$content = $content -replace '(?s)\s+{/\* Stats Dashboard \*/}.*?</View>\r?\n\r?\n', ''

# Update styles - remove greetingSub, update greetingContainer and greetingMain
$content = $content -replace '(?s)(greetingContainer: \{\r?\n\s+marginBottom: )\d+,\r?\n\s+\},\r?\n\s+greetingSub: \{[^}]+\},\r?\n\s+(greetingMain: \{\r?\n\s+color: COLORS\.text,\r?\n\s+fontSize: )\d+(,\r?\n\s+fontWeight: )''\d+''', '$116,`r`n  },`r`n  $224$3''600'''

$content = $content -replace '(greetingMain: \{[^}]*letterSpacing: -0\.5,)\r?\n\s+\}', '$1`r`n  }'

Set-Content $filePath $content -NoNewline

Write-Host "File updated successfully!"
