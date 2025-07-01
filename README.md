# Google Places Autocomplete

A simple HTML/CSS/JavaScript implementation of Google Places Autocomplete that shows place suggestions when you type 3-4 characters.

## Features

- Real-time place suggestions as you type
- Minimum 3 characters required to trigger search
- Debounced API calls (300ms delay) to reduce unnecessary requests
- Modern, responsive design
- Error handling and loading states
- Click outside to close suggestions

## Setup Instructions

### 1. Get Google Places API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API (New)**
4. Go to "Credentials" and create an API key
5. Restrict the API key to your domain for security

### 2. Configure the API Key

1. Open the application in your browser
2. Click the "⚙️ Settings" button to open the API configuration panel
3. Enter your Google Places API key in the input field
4. Click "Test API Key" to verify it works
5. Click "Save API Key" to store it locally

### 3. Run the Application

1. Make sure you have a web server running (like XAMPP)
2. Place the files in your web server directory
3. Open `index.html` in your browser
4. Start typing a place name (minimum 3 characters)

## File Structure

```
geotag-image/
├── index.html      # Main HTML file
├── style.css       # Styling for the interface
├── script.js       # JavaScript with autocomplete functionality
└── README.md       # This file
```

## How It Works

1. **Input Detection**: Listens for user input in the search field
2. **Debouncing**: Waits 300ms after user stops typing to make API call
3. **API Request**: Sends POST request to Google Places Autocomplete API
4. **Display Results**: Shows formatted suggestions in a dropdown
5. **Selection**: Allows user to click on a suggestion to select it

## API Configuration

The current configuration includes:
- **Location Bias**: Set to San Francisco area (latitude: 37.7937, longitude: -122.3965)
- **Radius**: 500 meters
- **Minimum Characters**: 3
- **Debounce Delay**: 300ms

You can modify these settings in the `script.js` file:

```javascript
// Change location bias
locationBias: {
    circle: {
        center: {
            latitude: YOUR_LATITUDE,
            longitude: YOUR_LONGITUDE
        },
        radius: YOUR_RADIUS
    }
}

// Change minimum characters
this.minCharacters = 3;

// Change debounce delay
setTimeout(() => {
    this.searchPlaces(query);
}, 300); // Change this value
```

## Customization

### Styling
Modify `style.css` to change the appearance:
- Colors, fonts, spacing
- Responsive breakpoints
- Animation effects

### Functionality
Modify `script.js` to add features:
- Different location biases
- Additional place details
- Custom event handling
- Integration with maps

## Troubleshooting

### Common Issues

1. **"Please add your Google Places API key"**
   - Make sure you've replaced `YOUR_API_KEY_HERE` with your actual API key

2. **"Error fetching places"**
   - Check if your API key is valid
   - Ensure Places API (New) is enabled in Google Cloud Console
   - Verify your API key restrictions

3. **No suggestions appearing**
   - Make sure you're typing at least 3 characters
   - Check browser console for error messages
   - Verify internet connection

### API Limits

- Google Places API has usage limits and costs
- Monitor your usage in Google Cloud Console
- Consider implementing caching for frequently searched places

## Security Notes

- Never expose your API key in client-side code in production
- Use domain restrictions on your API key
- Consider implementing a backend proxy for API calls
- Monitor API usage to prevent abuse

## Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile browsers supported