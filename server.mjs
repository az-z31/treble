import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import pg from 'pg';
import fetch from 'node-fetch';
import bcrypt from 'bcrypt';
import session from 'express-session';
import { fileURLToPath } from 'url';
import helmet from 'helmet';

const { Pool } = pg;

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the pool
const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'sh9704',
    database: 'loginformytvideo',
    port: 5432
});

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Successfully connected to the database');
    }
});

const app = express();

// Use helmet
app.use(helmet());

// Set a custom Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allows inline scripts
      scriptSrcAttr: ["'self'", "'unsafe-inline'"], // Added 'unsafe-inline' for inline event handlers
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.spotify.com", "https://accounts.spotify.com"],
      mediaSrc: ["'self'", "https://p.scdn.co"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  })
);

let initialPath = path.join(__dirname, "public");

app.use(bodyParser.json());
app.use(express.static(initialPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(initialPath, "index.html"));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(initialPath, "login.html"));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(initialPath, "register.html"));
});

// Add back the profile route
app.get('/profile', (req, res) => {
    res.sendFile(path.join(initialPath, "profile.html"));
});

app.get('/shop', (req, res) => {
    res.sendFile(path.join(initialPath, "shop.html"));
});


// Login route
app.post('/login-user', (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    pool.query('SELECT id, name, email FROM users WHERE email = $1 AND password = $2', [email, password])
        .then(result => {
            console.log('Query result:', result.rows);
            if(result.rows.length){
                res.json({
                    id: result.rows[0].id,
                    name: result.rows[0].name,
                    email: result.rows[0].email
                });
            } else{
                res.status(401).json({ error: 'Username or password is incorrect' });
            }
        })
        .catch(err => {
            console.error('Login error:', err);
            res.status(500).json({ error: 'An error occurred during login', details: err.message });
        });
});

// Fetch user playlists
app.get('/user-playlists/:userId', (req, res) => {
    const { userId } = req.params;
    console.log('Fetching playlists for user:', userId);
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }
    pool.query('SELECT id, name FROM playlists WHERE user_id = $1', [userId])
        .then(result => {
            console.log('Playlists fetched for user', userId, ':', result.rows);
            res.json(result.rows);
        })
        .catch(err => {
            console.error('Error fetching playlists:', err);
            res.status(500).json({ error: 'Error fetching playlists' });
        });
});

// Create new playlist
app.post('/create-playlist', (req, res) => {
    const { userId, name } = req.body;
    console.log('Creating playlist:', name, 'for user:', userId);
    if (!userId || !name) {
        return res.status(400).json({ error: 'Missing userId or name' });
    }
    pool.query('INSERT INTO playlists (user_id, name) VALUES ($1, $2) RETURNING id, name', [userId, name])
        .then(result => {
            console.log('Playlist created:', result.rows[0]);
            res.json(result.rows[0]);
        })
        .catch(err => {
            console.error('Error creating playlist:', err);
            res.status(500).json({ error: 'Error creating playlist' });
        });
});

// Add other routes (register, profile, etc.) here...

// Add this new route to your server.js file
app.get('/playlist-tracks/:playlistId', async (req, res) => {
    const { playlistId } = req.params;
    try {
        const result = await pool.query(`
            SELECT t.id, t.name, t.artist, p.name as playlist_name
            FROM tracks t
            JOIN playlist_tracks pt ON t.id = pt.track_id
            JOIN playlists p ON p.id = pt.playlist_id
            WHERE pt.playlist_id = $1
        `, [playlistId]);
        console.log('Fetched playlist tracks:', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching playlist tracks:', err);
        res.status(500).json({ error: 'Error fetching playlist tracks' });
    }
});

// Add this new route to fetch playlist name
app.get('/playlist/:playlistId', (req, res) => {
    const { playlistId } = req.params;
    console.log('Fetching playlist:', playlistId);
    if (!playlistId) {
        return res.status(400).json({ error: 'Missing playlistId' });
    }
    pool.query('SELECT name FROM playlists WHERE id = $1', [playlistId])
        .then(result => {
            if (result.rows.length > 0) {
                console.log('Playlist fetched:', result.rows[0]);
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'Playlist not found' });
            }
        })
        .catch(err => {
            console.error('Error fetching playlist:', err);
            res.status(500).json({ error: 'Error fetching playlist' });
        });
});

app.post('/register-user', (req, res) => {
    const { name, email, password } = req.body;
    console.log('Registering user:', name, email);

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email', [name, email, password])
        .then(result => {
            console.log('User registered:', result.rows[0]);
            res.json({
                id: result.rows[0].id,
                name: result.rows[0].name,
                email: result.rows[0].email
            });
        })
        .catch(err => {
            console.error('Registration error:', err);
            res.status(500).json({ error: 'An error occurred during registration', details: err.message });
        });
});

// Add this new route to handle playlist deletion
app.delete('/delete-playlist/:playlistId', (req, res) => {
    const { playlistId } = req.params;
    console.log('Deleting playlist:', playlistId);
    if (!playlistId) {
        return res.status(400).json({ error: 'Missing playlistId' });
    }
    pool.query('DELETE FROM playlists WHERE id = $1', [playlistId])
        .then(() => {
            console.log('Playlist deleted:', playlistId);
            // Return a JSON response instead of just sending status
            res.json({ message: 'Playlist deleted successfully' });
        })
        .catch(err => {
            console.error('Error deleting playlist:', err);
            res.status(500).json({ error: 'Error deleting playlist' });
        });
});

app.post('/add-track-to-playlist', async (req, res) => {
    const { playlistId, trackId, trackName, artistName } = req.body;
    console.log('Adding track to playlist:', playlistId, trackId, trackName, artistName);
    if (!playlistId || !trackId || !trackName || !artistName) {
        return res.status(400).json({ error: 'Missing required track information' });
    }
    try {
        // Insert or update the track in the tracks table
        await pool.query(`
            INSERT INTO tracks (id, name, artist)
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO UPDATE
            SET name = EXCLUDED.name, artist = EXCLUDED.artist
        `, [trackId, trackName, artistName]);
        
        // Add the track to the playlist
        await pool.query('INSERT INTO playlist_tracks (playlist_id, track_id) VALUES ($1, $2)', [playlistId, trackId]);
        
        console.log('Track added to playlist successfully:', playlistId, trackId);
        res.json({ message: 'Track added successfully' });
    } catch (err) {
        console.error('Error adding track to playlist:', err);
        res.status(500).json({ error: 'Error adding track to playlist', details: err.message });
    }
});

// Add this new route to fetch user's Treble Tokens
app.get('/user-tokens/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log('Fetching tokens for user:', userId);
    try {
        // Parse userId to ensure it's a number
        const parsedUserId = parseInt(userId, 10);
        if (isNaN(parsedUserId)) {
            throw new Error('Invalid user ID');
        }

        const result = await pool.query('SELECT treble_tokens FROM users WHERE id = $1', [parsedUserId]);
        console.log('Query result:', result.rows);
        
        if (result.rows.length > 0) {
            const tokens = result.rows[0].treble_tokens;
            console.log('Sending tokens:', tokens);
            res.json({ trebleTokens: tokens });
        } else {
            console.log('User not found');
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error('Error fetching user tokens:', err);
        res.status(500).json({ error: 'Error fetching user tokens', details: err.message });
    }
});

// Add this new route to update user's Treble Tokens
app.post('/update-tokens', async (req, res) => {
    const { userId, tokens } = req.body;
    try {
        await pool.query('UPDATE users SET treble_tokens = $1 WHERE id = $2', [tokens, userId]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating user tokens:', err);
        res.status(500).json({ error: 'Error updating user tokens' });
    }
});

const port = 3000; // or whatever port you're using

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
