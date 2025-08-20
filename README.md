# Airbike Zajazd - Timer App

A workout timer application with acceleration intervals and audio notifications.

## Features

- **Workout Timer**: Configurable preparation, work, and rest phases
- **Acceleration Intervals**: Random acceleration periods during work phases
- **Audio Notifications**: Sound alerts for phase changes and accelerations
- **Mobile Optimized**: Web Audio API implementation for reliable mobile audio

## Audio Implementation

This app uses the **Web Audio API** for reliable audio playback across all devices:

### Why Web Audio API?

- **Better mobile compatibility**: More reliable across different mobile browsers
- **iOS Safari support**: Works properly with iOS audio restrictions
- **Audio context management**: Better control over audio state and resumption
- **Buffer-based playback**: More consistent timing and better performance

### How It Works

1. **Audio Initialization**: Creates AudioContext on component mount
2. **User Interaction**: Listens for first user interaction (click, tap) to enable audio
3. **Context Resume**: Automatically resumes suspended audio context on iOS
4. **Buffer Loading**: Loads audio files as ArrayBuffers for mobile compatibility
5. **iOS Optimization**: Special handling for iOS Safari audio quirks

### Audio Files

- `bell_start.mp3` - Work phase start notification
- `bell_end.mp3` - Work phase end notification
- `acc_start.mp3` - Acceleration start notification
- `acc_end.mp3` - Acceleration end notification

## Mobile Compatibility

### iOS Devices

- **Automatic detection**: App detects iOS devices and applies special handling
- **Audio context management**: Properly handles suspended audio contexts
- **User interaction**: Audio only plays after user interaction (iOS requirement)
- **Volume optimization**: Slightly reduced volume for better iOS compatibility

### Android Devices

- **Web Audio API**: Uses modern audio standards for reliable playback
- **Touch events**: Properly handles touch interactions for audio enablement

## Development

Built with:

- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- Framer Motion
- Zustand (state management)
- Web Audio API

## Usage

1. Configure your workout settings (preparation, work, rest times, rounds)
2. Enable/disable accelerations and configure their parameters
3. Wait for "Dźwięk gotowy" (Audio ready) indicator
4. Click start to begin your workout
5. Audio will play automatically for phase changes and accelerations
6. Use the TEST button to verify audio is working on your device

## Mobile Testing

### iOS Testing

1. Open the app in Safari on your iOS device
2. Wait for "Dźwięk gotowy" (Audio ready) indicator
3. Tap any button to enable audio
4. Use the TEST button to verify audio playback
5. Start your workout - sounds should now play correctly

### Android Testing

1. Open the app in Chrome or your preferred browser
2. Wait for "Dźwięk gotowy" (Audio ready) indicator
3. Tap any button to enable audio
4. Use the TEST button to verify audio functionality
5. Start your workout

## Troubleshooting

If audio doesn't work:

1. **Check audio status**: Look for "Dźwięk gotowy" indicator
2. **User interaction**: Ensure you've tapped/clicked something on the page
3. **Browser compatibility**: Use Safari on iOS, Chrome on Android
4. **Audio not muted**: Check that audio isn't muted in browser/system
5. **Console errors**: Check browser console for error messages
6. **Test button**: Use the TEST button to verify audio functionality

### Common Issues

- **iOS Safari**: Audio context may be suspended - tap any button to resume
- **Mobile browsers**: Some require HTTPS for audio to work
- **Audio loading**: Large audio files may take time to load on slow connections

## Technical Details

### Audio Context States

- `suspended`: Audio context is paused (common on iOS)
- `running`: Audio context is active and playing
- `closed`: Audio context has been closed

### Audio Buffer Management

- Audio files are loaded as ArrayBuffers on app start
- Converted to AudioBuffers for playback
- Automatic cleanup after each sound plays
- Memory efficient for mobile devices
