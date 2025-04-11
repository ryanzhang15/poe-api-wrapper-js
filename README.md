# Poe API Wrapper for Node.js

A Node.js wrapper for the Poe.com API that allows you to interact with various AI models including ChatGPT, Claude, and more.

## Installation

```bash
npm install poe-api-wrapper
```

## Setup

To use this API, you'll need your Poe.com tokens:
- `p-b`: Your p-b cookie value
- `p-lat`: Your p-lat cookie value

You can find these tokens by:
1. Logging into poe.com
2. Opening your browser's developer tools
3. Going to the Application/Storage tab
4. Looking for the cookies named 'p-b' and 'p-lat'

## Usage

```javascript
import { PoeApi } from 'poe-api-wrapper';

// Initialize the API with your tokens
const poe = new PoeApi(
    'your_p_b_token_here',  // Your p-b token
    'your_p_lat_token_here' // Your p-lat token
);

// Get available bots
const bots = await poe.getAvailableBots();
console.log('Available bots:', bots);

// Send a message
const response = await poe.sendMessage('Assistant', 'Hello, how are you?');
console.log('Bot response:', response);

// Get chat history
const history = await poe.getChatHistory('Assistant');
console.log('Chat history:', history);
```

## Features

- Send messages to any available bot
- Get chat history
- Real-time updates via WebSocket
- Purge conversations
- Get available bots
- Proxy support

## API Reference

### Constructor
```javascript
new PoeApi(p_b, p_lat, proxy)
```
- `p_b`: Your p-b token from poe.com
- `p_lat`: Your p-lat token from poe.com
- `proxy`: Optional proxy URL

### Methods

- `getSettings()`: Get user settings
- `getAvailableBots(count, getAll)`: Get list of available bots
- `sendMessage(bot, message, chatId, chatCode, timeout)`: Send a message to a bot
- `getChatHistory(bot, count, interval, cursor)`: Get chat history
- `purgeConversation(bot, chatId, chatCode, count, delAll)`: Delete messages from a conversation
- `connectWebSocket()`: Connect to WebSocket for real-time updates
- `disconnectWebSocket()`: Disconnect from WebSocket

### Events

- `connected`: Emitted when WebSocket connects
- `disconnected`: Emitted when WebSocket disconnects
- `message`: Emitted when a message is received
- `error`: Emitted when an error occurs


