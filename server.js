import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint for UptimeRobot
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// For any other request, send back index.html (SPA support)
// Using app.use() instead of app.get() to avoid strict regex path-to-regexp errors
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check available at /ping`);
});
