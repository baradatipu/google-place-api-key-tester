# Troubleshooting Google Places API Issues

## Common Error: "CORS error or network issue"

This error typically occurs when running the application on localhost due to Google's API restrictions.

### Solution 1: Configure API Key Restrictions (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Click on your API key
4. Under **Application restrictions**, select **HTTP referrers (web sites)**
5. Add these referrers:
   ```
   http://localhost/*
   http://127.0.0.1/*
   http://localhost:80/*
   http://localhost:8080/*
   ```
6. Under **API restrictions**, ensure **Places API (New)** is selected
7. Save the changes

### Solution 2: Use a Local Domain

1. Edit your hosts file:
   - **Windows**: `C:\Windows\System32\drivers\etc\hosts`
   - **Mac/Linux**: `/etc/hosts`
2. Add this line:
   ```
   127.0.0.1 myapp.local
   ```
3. Access your app via `http://myapp.local/geotag-image/`
4. Update API key restrictions to include `http://myapp.local/*`

### Solution 3: Use HTTPS (For Production)

1. Set up SSL certificate for your domain
2. Configure API key for your HTTPS domain
3. Update all references to use HTTPS

## Error: "Invalid API key or API key restrictions"

### Check API Key Setup:

1. **Enter API Key**: Use the Settings panel to enter your Google Places API key
2. **Test API Key**: Click "Test API Key" to verify it works correctly
3. **Enable Places API**: In Google Cloud Console, enable **Places API (New)**
4. **Check Billing**: Ensure billing is enabled for your Google Cloud project
5. **API Restrictions**: Make sure your domain is allowed in API key restrictions

## Error: "Permission denied"

### Solutions:

1. **Enable Places API (New)**:
   - Go to Google Cloud Console
   - Navigate to **APIs & Services > Library**
   - Search for "Places API (New)"
   - Click **Enable**

2. **Check API Key Permissions**:
   - Ensure the API key has access to Places API
   - Remove any unnecessary API restrictions

## Error: "Too many requests"

### Solutions:

1. **Increase Debounce Delay**:
   ```javascript
   // In script.js, increase the timeout value
   setTimeout(() => {
       this.searchPlaces(query);
   }, 500); // Increased from 300ms to 500ms
   ```

2. **Implement Caching**:
   - Store recent search results
   - Avoid duplicate API calls

3. **Monitor Usage**:
   - Check your quota in Google Cloud Console
   - Consider upgrading your plan if needed

## Testing Your Setup

### Step 1: Check API Key
Use the built-in "Test API Key" button in the Settings panel, or add this to your browser console:
```javascript
// Replace 'YOUR_ACTUAL_API_KEY' with your real API key
fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': 'YOUR_ACTUAL_API_KEY'
    },
    body: JSON.stringify({
        input: 'pizza'
    })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));
```

### Step 2: Check Network Tab
1. Open browser Developer Tools (F12)
2. Go to **Network** tab
3. Try searching in your app
4. Look for the API request and check its status

### Step 3: Check Console Errors
1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Look for any JavaScript errors

## Alternative: Backend Proxy (Advanced)

If CORS issues persist, consider creating a backend proxy:

### PHP Example (for XAMPP users):

```php
<?php
// api-proxy.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $apiKey = 'YOUR_ACTUAL_GOOGLE_PLACES_API_KEY'; // Replace with your real API key
    $url = 'https://places.googleapis.com/v1/places:autocomplete';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($input));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'X-Goog-Api-Key: ' . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    echo $response;
}
?>
```

Then update your JavaScript to call the proxy:
```javascript
// Change the fetch URL to your proxy
const response = await fetch('/api-proxy.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        input: query,
        locationBias: {
            // ... your location bias settings
        }
    })
});
```

## Contact Support

If issues persist:
1. Check [Google Places API documentation](https://developers.google.com/maps/documentation/places/web-service/autocomplete)
2. Visit [Google Cloud Support](https://cloud.google.com/support)
3. Check [Stack Overflow](https://stackoverflow.com/questions/tagged/google-places-api) for similar issues