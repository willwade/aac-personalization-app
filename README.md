# AAC Context-Aware Personalization App

This project is an open-source prototype designed to enhance communication for individuals who use Augmentative and Alternative Communication (AAC) systems. It leverages social graph data, adaptive questionnaires, and real-time conversational logging to create a highly personalized communication experience.

## Features
- **Social Network Questionnaire:** Guided, adaptive UI for caregivers to build a social graph of the AAC user’s relationships, interests, and communication preferences.
- **Circles of Communication Visualization:** Interactive, concentric-circle visualizations to represent the user’s social network.
- **Communication Passport:** Auto-generated, customizable document summarizing key information about the AAC user for new communication partners.
- **Conversation Logging:** Partner-facing interface for logging and analyzing conversations, with future support for audio transcription (Whisper).
- **Insights & Analytics:** Visual and data-driven insights into communication patterns and social context.

## Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS, D3.js/React Flow
- **Backend:** Next.js API routes (future: Neo4j or JSON-based storage)
- **AI Integration:** GPT-4 (for adaptive questions), Whisper (for transcription, planned)
- **Other:** TypeScript, Vercel/DO for hosting

## Getting Started
1. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```
2. **Run the development server:**
   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

   **Note:** Do NOT use `npx run dev` — this will not start the app. Always use your package manager's script runner as above.

3. **Explore the App:**

---

## Environment Variables

Some features require environment variables. Create a `.env.local` file in the project root and add any required keys. Example:

```env
# Example environment variables
OPENAI_API_KEY=your-openai-api-key-here
WHISPER_API_KEY=your-whisper-api-key-here
# Add any other required variables below
```

- If you are missing a required variable, the app may fail to start or certain features may not work.
- Check the `.envrc` file or the `/app/api` code for any additional required variables.

   - Start with the Social Networks section to build a user’s social graph.
   - Generate a Communication Passport.
   - Log and analyze conversations (demo/sample data).

## Project Structure
- `/app` — Main Next.js app pages and routes
- `/components` — UI and functional components
- `/lib` — Data models and utility functions
- `/styles` — Tailwind and global CSS

## Roadmap / To-Do
See `to-do.md` and `to-do-status.md` for current development status and plans.

## Contributing
Pull requests and feedback are welcome! Please open an issue or PR to discuss improvements or new features.

## Privacy & Security
- All user data is stored locally on your device in encrypted JSON files (AES-256).
- No personal or sensitive information is sent to any server or cloud by default.
- All CRUD operations are performed via local API endpoints that only interact with encrypted files on your machine.
- You may export or backup your data, but it will never be transmitted externally unless you choose to do so.
- For additional security, set the `JSON_ENCRYPTION_KEY` environment variable to a strong, unique value.

## License
[MIT](LICENSE)
