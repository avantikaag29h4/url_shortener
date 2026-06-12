# URL Shortener API

A REST API that shortens long URLs, built with Node.js, Express and MySQL.

## Tech Stack
- Node.js
- Express.js
- MySQL
- nanoid

## Setup

1. Clone the repo
   git clone https://github.com/avantikaag29h4/url_shortener.git

2. Install dependencies
   npm install

3. Copy .env.example to .env and fill in your values

4. Start MySQL and create the database
   CREATE DATABASE url_shortener;

5. Run the server
   npm run dev
   ## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/urls | Shorten a long URL |
| GET | /api/urls | Get all URLs |
| DELETE | /api/urls/:shortCode | Delete a URL |
| GET | /:shortCode | Redirect to original URL |

## Example

POST /api/urls
Body: { "originalUrl": "https://www.google.com" }
Response: { "shortUrl": "http://localhost:4000/abc123" }
