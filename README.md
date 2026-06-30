# MeetingFlow

MeetingFlow is a React Native mobile app that turns pasted meeting transcripts into structured meeting outputs such as summaries, key discussion points, action items, and follow-up emails. The app uses the Groq API to generate the content and stores previous analyses locally for quick review.

## Features

- Paste a meeting transcript and analyze it in seconds
- Generate a concise meeting summary
- Extract action items and discussion points
- Create a professional follow-up email draft
- Review saved analyses from the History screen
- Regenerate or share results from the result screen

## Requirements

Before you start, make sure you have:

- Node.js 22.11.0 or newer
- npm
- Android Studio and Android SDK for Android builds, or Xcode and CocoaPods for iOS builds
- A Groq API key

## Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd MeetingFlow
   ```

2. Install JavaScript dependencies
   ```bash
   npm install
   ```

3. Create an environment file
   Create a file named `.env` in the project root with your Groq key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. Generate the app config
   ```bash
   npm run generate-env
   ```
   This creates the generated config file used by the app from your `.env` values.

5. For iOS only, install CocoaPods dependencies
   ```bash
   bundle install
   cd ios
   pod install
   cd ..
   ```

## Running the app

### Start Metro

```bash
npm start
```

### Android

Open a second terminal and run:

```bash
npm run android
```

### iOS

Open a second terminal and run:

```bash
npm run ios
```

## How to use the app

1. Launch the app on an emulator, simulator, or physical device.
2. On the Home screen, paste the meeting transcript into the text box.
3. Tap "Analyze Meeting".
4. Wait for the AI-generated result to appear on the Result screen.
5. Review the summary, discussion points, action items, and follow-up email.
6. Use the buttons to copy, share, or regenerate the content.
7. Open History to browse previously analyzed meetings.

## Project structure

- [src/screens](src/screens) — Home, Result, and History screens
- [src/store](src/store) — Zustand store for transcript and analysis state
- [src/api](src/api) — Groq API integration
- [src/utils](src/utils) — storage and meeting analysis helpers
- [scripts](scripts) — environment config generation script

## Troubleshooting

- If you see a message about a missing Groq API key, make sure your `.env` file exists and run `npm run generate-env` again.
- If Metro has stale cache issues, restart it with:
  ```bash
  npx react-native start --reset-cache
  ```
- If Android fails to build, confirm that your emulator or device is running and that the Android SDK is configured correctly.
- If iOS fails to build, run `pod install` again inside the `ios` folder.

## Testing

Run the test suite with:

```bash
npm test
```
