const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const mysql = require('mysql');

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'uab',
    password: 'UAB-Mr.clash97248',
    database: 'uab'
});

// Connect to MySQL
connection.connect(error => {
    if (error) {
        console.error('Error connecting to database:', error);
        process.exit(1);
    }
    console.log('Successfully connected to database');
});

const app = express();
const port = 3000;

// Database initialization
function initializeDatabase() {
    // Create users table
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            password VARCHAR(255),
            profile_image VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Create enrollments table
    const createEnrollmentsTable = `
        CREATE TABLE IF NOT EXISTS enrollments (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT,
            course_name VARCHAR(255),
            status VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `;

    connection.query(createUsersTable, (error) => {
        if (error) {
            console.error('Error creating users table:', error);
            process.exit(1);
        }
        console.log('Users table ready');
    });

    connection.query(createEnrollmentsTable, (error) => {
        if (error) {
            console.error('Error creating enrollments table:', error);
            process.exit(1);
        }
        console.log('Enrollments table ready');
    });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Auth check middleware
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

// Register endpoint
app.post('/api/register', upload.single('profile_image'), async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    connection.query(
        'INSERT INTO users (name, email, password, profile_image) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, profileImage],
        (error) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Registration failed' });
            }
            res.json({ message: 'Registration successful' });
        }
    );
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        async (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Login failed' });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const user = results[0];
            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            req.session.userId = user.id;
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                profile_image: user.profile_image
            });
        }
    );
});

// Check auth status endpoint
app.get('/api/check-auth', (req, res) => {
    if (!req.session.userId) {
        return res.json({ isLoggedIn: false });
    }

    connection.query(
        'SELECT id, name, email, profile_image FROM users WHERE id = ?',
        [req.session.userId],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Server error' });
            }

            if (results.length === 0) {
                return res.json({ isLoggedIn: false });
            }

            res.json({
                isLoggedIn: true,
                user: results[0]
            });
        }
    );
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
});

// Enrollment endpoint
app.post('/api/enroll', requireAuth, upload.none(), (req, res) => {
    const userId = req.session.userId;
    const { course_name } = req.body;

    connection.query(
        'INSERT INTO enrollments (user_id, course_name, status) VALUES (?, ?, ?)',
        [userId, course_name, 'pending'],
        (error) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Enrollment failed' });
            }
            res.json({ message: 'Enrollment successful' });
        }
    );
});

// Update profile image from file upload
app.post('/api/update-profile-image', requireAuth, upload.single('profile_image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const profileImage = `/uploads/${req.file.filename}`;
    
    connection.query(
        'UPDATE users SET profile_image = ? WHERE id = ?',
        [profileImage, req.session.userId],
        (error) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Failed to update profile image' });
            }
            res.json({ 
                message: 'Profile image updated successfully',
                profile_image: profileImage
            });
        }
    );
});

// Update profile image from URL
app.post('/api/update-profile-image-url', requireAuth, (req, res) => {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
        return res.status(400).json({ message: 'No image URL provided' });
    }

    connection.query(
        'UPDATE users SET profile_image = ? WHERE id = ?',
        [imageUrl, req.session.userId],
        (error) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Failed to update profile image' });
            }
            res.json({ 
                message: 'Profile image updated successfully',
                profile_image: imageUrl
            });
        }
    );
});

// Initialize database and start server
initializeDatabase();
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 