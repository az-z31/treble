# Treble Music Application

## Description
Treble is a music application that allows users to create playlists, listen to music, and manage their profiles. The application features a shop where users can purchase items using Treble Tokens, a currency within the app. It provides a user-friendly interface for searching and playing music, as well as managing user accounts.

## Features
- User authentication (login and registration)
- Create and manage playlists
- Search for music tracks
- Play music with a built-in audio player
- Shop for premium features using Treble Tokens
- Responsive design for various devices

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Libraries**: Body-parser, Express-session, Helmet, Knex

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/az-z31/treble.git
   cd treble
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the PostgreSQL database:
   - Create a new database in PostgreSQL.
   - Update the database connection details in `server.mjs`.

4. Create a `.env` file in the root directory and add your environment variables (if needed).

5. Start the server:
   ```bash
   npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`.

## Usage
- **Login**: Use the login page to access your account.
- **Register**: Create a new account if you don't have one.
- **Create Playlist**: Use the sidebar to create and manage your playlists.
- **Search Music**: Use the search bar to find and play music tracks.
- **Shop**: Visit the shop to purchase items using Treble Tokens.

## Contributing
Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Thanks to the contributors and the open-source community for their support and resources.
