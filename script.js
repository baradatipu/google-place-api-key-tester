class PlacesAutocomplete {
    constructor() {
        this.input = document.getElementById('placeInput');
        this.suggestionsContainer = document.getElementById('suggestions');
        this.debounceTimer = null;
        this.minCharacters = 3;
        
        // API Configuration elements
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.configContent = document.getElementById('configContent');
        this.apiStatus = document.getElementById('apiStatus');
        
        this.init();
        this.initApiConfig();
    }
    
    init() {
        this.input.addEventListener('input', (e) => this.handleInput(e));
        this.input.addEventListener('focus', (e) => this.handleFocus(e));
        document.addEventListener('click', (e) => this.handleDocumentClick(e));
    }
    
    initApiConfig() {
        // Load saved API key
        this.loadApiKey();
        
        // Toggle config panel
        document.getElementById('toggleConfig').addEventListener('click', () => {
            this.configContent.classList.toggle('active');
        });
        
        // Show/hide API key
        document.getElementById('showApiKey').addEventListener('click', () => {
            const type = this.apiKeyInput.type === 'password' ? 'text' : 'password';
            this.apiKeyInput.type = type;
        });
        
        // Save API key
        document.getElementById('saveApiKey').addEventListener('click', () => {
            this.saveApiKey();
        });
        
        // Test API key
        document.getElementById('testApiKey').addEventListener('click', () => {
            this.testApiKey();
        });
        
        // Clear API key
        document.getElementById('clearApiKey').addEventListener('click', () => {
            this.clearApiKey();
        });
        
        // Auto-save on Enter key
        this.apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveApiKey();
            }
        });
    }
    
    getApiKey() {
        return localStorage.getItem('googlePlacesApiKey');
    }
    
    loadApiKey() {
        const savedKey = localStorage.getItem('googlePlacesApiKey');
        if (savedKey) {
            this.apiKeyInput.value = savedKey;
            this.showStatus('API key loaded from storage', 'success');
        }
    }
    
    saveApiKey() {
        const apiKey = this.apiKeyInput.value.trim();
        if (!apiKey) {
            this.showStatus('Please enter an API key', 'error');
            return;
        }
        
        localStorage.setItem('googlePlacesApiKey', apiKey);
        this.showStatus('API key saved successfully!', 'success');
    }
    
    async testApiKey() {
        const apiKey = this.apiKeyInput.value.trim() || this.getApiKey();
        
        if (!apiKey) {
            this.showStatus('Please enter a valid API key to test', 'error');
            return;
        }
        
        this.showStatus('Testing API key...', 'info');
        
        try {
            const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': apiKey
                },
                body: JSON.stringify({
                    input: 'test',
                    locationBias: {
                        circle: {
                            center: {
                                latitude: 37.7937,
                                longitude: -122.3965
                            },
                            radius: 500.0
                        }
                    }
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showStatus('✅ API key is working correctly!', 'success');
                // Auto-save if test is successful
                if (this.apiKeyInput.value.trim()) {
                    this.saveApiKey();
                }
            } else {
                this.showStatus(`❌ API Error: ${data.error?.message || 'Invalid API key'}`, 'error');
            }
            
        } catch (error) {
            this.showStatus(`❌ Network Error: ${error.message}`, 'error');
        }
    }
    
    clearApiKey() {
        this.apiKeyInput.value = '';
        localStorage.removeItem('googlePlacesApiKey');
        this.showStatus('API key cleared', 'info');
    }
    
    showStatus(message, type) {
        this.apiStatus.textContent = message;
        this.apiStatus.className = `api-status ${type}`;
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.apiStatus.style.display = 'none';
            }, 3000);
        }
    }
    
    handleInput(e) {
        const query = e.target.value.trim();
        
        // Clear previous timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        // Hide suggestions if input is too short
        if (query.length < this.minCharacters) {
            this.hideSuggestions();
            return;
        }
        
        // Debounce the API call
        this.debounceTimer = setTimeout(() => {
            this.searchPlaces(query);
        }, 300);
    }
    
    handleFocus(e) {
        const query = e.target.value.trim();
        if (query.length >= this.minCharacters) {
            this.searchPlaces(query);
        }
    }
    
    handleDocumentClick(e) {
        if (!this.input.contains(e.target) && !this.suggestionsContainer.contains(e.target)) {
            this.hideSuggestions();
        }
    }
    
    async searchPlaces(query) {
        const apiKey = this.getApiKey();
        
        if (!apiKey) {
            this.showError('Please configure your Google Places API key using the Settings panel above.');
            return;
        }
        
        this.showLoading();
        
        try {
            const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': apiKey
                },
                body: JSON.stringify({
                    input: query,
                    locationBias: {
                        circle: {
                            center: {
                                latitude: 37.7937,
                                longitude: -122.3965
                            },
                            radius: 500.0
                        }
                    }
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                this.handleApiError(data.error, response.status);
                return;
            }
            
            this.displaySuggestions(data.suggestions || []);
            
        } catch (error) {
            console.error('Error fetching places:', error);
            this.handleNetworkError(error);
        }
    }
    
    handleApiError(error, status) {
        let errorMessage = 'API Error: ';
        
        switch (status) {
            case 403:
                if (error?.message?.includes('unregistered callers')) {
                    errorMessage += 'Invalid API key or API key restrictions. Check your Google Cloud Console settings.';
                } else if (error?.message?.includes('PERMISSION_DENIED')) {
                    errorMessage += 'Permission denied. Verify your API key has Places API enabled.';
                } else {
                    errorMessage += 'Access forbidden. Check API key restrictions and billing.';
                }
                break;
            case 400:
                errorMessage += 'Bad request. Check your input parameters.';
                break;
            case 429:
                errorMessage += 'Too many requests. Please wait and try again.';
                break;
            case 500:
                errorMessage += 'Google server error. Please try again later.';
                break;
            default:
                errorMessage += error?.message || `HTTP ${status} error`;
        }
        
        this.showError(errorMessage);
    }
    
    handleNetworkError(error) {
        let errorMessage = 'Network Error: ';
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            errorMessage += 'CORS error or network issue. This might be due to:';
            errorMessage += '\n• API key restrictions (check allowed domains in Google Cloud Console)';
            errorMessage += '\n• Running on localhost (try using a proper domain or disable CORS restrictions)';
            errorMessage += '\n• Network connectivity issues';
        } else if (error.name === 'AbortError') {
            errorMessage += 'Request was cancelled.';
        } else {
            errorMessage += error.message || 'Unknown network error';
        }
        
        this.showError(errorMessage);
    }
    
    displaySuggestions(suggestions) {
        this.suggestionsContainer.innerHTML = '';
        
        if (suggestions.length === 0) {
            this.showNoResults();
            return;
        }
        
        suggestions.forEach(suggestion => {
            const item = this.createSuggestionItem(suggestion);
            this.suggestionsContainer.appendChild(item);
        });
        
        this.showSuggestions();
    }
    
    createSuggestionItem(suggestion) {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        
        const mainText = suggestion.placePrediction?.text?.text || suggestion.text || 'Unknown place';
        const secondaryText = suggestion.placePrediction?.structuredFormat?.secondaryText?.text || '';
        
        item.innerHTML = `
            <div class="suggestion-main">${this.escapeHtml(mainText)}</div>
            ${secondaryText ? `<div class="suggestion-secondary">${this.escapeHtml(secondaryText)}</div>` : ''}
        `;
        
        item.addEventListener('click', () => {
            this.selectPlace(mainText);
        });
        
        return item;
    }
    
    selectPlace(placeName) {
        this.input.value = placeName;
        this.hideSuggestions();
        
        // Trigger a custom event for when a place is selected
        const event = new CustomEvent('placeSelected', {
            detail: { placeName }
        });
        this.input.dispatchEvent(event);
    }
    
    showLoading() {
        this.suggestionsContainer.innerHTML = '<div class="loading">Searching places...</div>';
        this.showSuggestions();
    }
    
    showError(message) {
        this.suggestionsContainer.innerHTML = `<div class="error">${this.escapeHtml(message)}</div>`;
        this.showSuggestions();
    }
    
    showNoResults() {
        this.suggestionsContainer.innerHTML = '<div class="no-results">No places found</div>';
        this.showSuggestions();
    }
    
    showSuggestions() {
        this.suggestionsContainer.style.display = 'block';
    }
    
    hideSuggestions() {
        this.suggestionsContainer.style.display = 'none';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the autocomplete when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const autocomplete = new PlacesAutocomplete();
    
    // Optional: Listen for place selection events
    document.getElementById('placeInput').addEventListener('placeSelected', (e) => {
        console.log('Place selected:', e.detail.placeName);
        // You can add additional functionality here when a place is selected
    });
});