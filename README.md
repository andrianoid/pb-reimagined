# PaceBuddy Reimagined

This repository contains design specs, schemas, and minimal server stubs for the PaceBuddy MVP.

## Design Assets
- [Director View Wireframe](design/director_view_wireframe.png)
- [Stage Manager View Wireframe](design/stage_manager_view_wireframe.png)
- [Performer View Wireframe](design/performer_view_wireframe.png)

See `PaceBuddy ReImagined.md` for a full overview of the project and links to additional documentation.

## Local Development

### Requirements
- [Node.js](https://nodejs.org/) 18 or higher
- npm

### Setup
1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env-sample` to `.env` and populate the values:
   - `OPENAI_API_KEY` – required for OpenAI integrations.
   - `PORT` – port for the server (defaults to `3000`).
3. Start the server:
   ```
   node server/index.js
   ```
4. Run tests:
   ```
   npm test
   ```

The application reads configuration from environment variables. Use a `.env` file for local development and load it with a tool such as [`dotenv`](https://www.npmjs.com/package/dotenv) or by exporting variables before running commands.