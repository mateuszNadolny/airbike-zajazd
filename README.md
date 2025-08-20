# Airbike Zajazd - Timer App

A workout timer application with acceleration intervals and audio notifications.

## Features

- **Workout Timer**: Configurable preparation, work, and rest phases
- **Acceleration Intervals**: Random acceleration periods during work phases
- **Audio Notifications**: Sound alerts for phase changes and accelerations
- **iOS Compatible**: Fixed audio playback issues on iOS devices

## iOS Audio Solution

This app includes a comprehensive solution for iOS audio playback issues:

### The Problem

iOS Safari has strict autoplay policies that prevent audio from playing without user interaction. Traditional HTML5 Audio elements don't work reliably on iOS.

### The Solution

- **Web Audio API**: Replaced HTML5 Audio with Web Audio API for better iOS compatibility
- **Audio Context Management**: Properly handles suspended audio contexts on iOS
- **User Interaction Tracking**: Ensures audio only plays after user interaction
- **Audio Buffer Loading**: Loads audio files as ArrayBuffers for iOS compatibility

### How It Works

1. **Audio Initialization**: Creates AudioContext on component mount
2. **User Interaction**: Marks first user interaction (click, tap) to enable audio
3. **Context Resume**: Automatically resumes suspended audio context on iOS
4. **Buffer Playback**: Converts ArrayBuffers to AudioBuffers for playback

### Audio Files

- `bell_start.mp3` - Work phase start notification
- `bell_end.mp3` - Work phase end notification
- `acc_start.mp3` - Acceleration start notification
- `acc_end.mp3` - Acceleration end notification

## Development

Built with:

- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- Framer Motion
- Zustand (state management)

## Usage

1. Configure your workout settings (preparation, work, rest times, rounds)
2. Enable/disable accelerations and configure their parameters
3. Click start to begin your workout
4. Audio will play automatically for phase changes and accelerations
5. Use the test button to verify audio is working on your device

## iOS Testing

To test on iOS:

1. Open the app in Safari on your iOS device
2. Wait for "Dźwięk gotowy" (Audio ready) indicator
3. Tap any button to enable audio
4. Use the TEST button to verify audio playback
5. Start your workout - sounds should now play correctly

## Troubleshooting

If audio doesn't work:

1. Ensure you're using a supported browser (Safari, Chrome on iOS)
2. Check that you've interacted with the page (tapped a button)
3. Verify audio isn't muted
4. Check browser console for error messages
5. Try the TEST button to verify audio functionality
