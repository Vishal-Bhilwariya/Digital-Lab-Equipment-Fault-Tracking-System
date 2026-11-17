Technology Stack

The Digital Lab Equipment Calibration & Fault Tracking System uses the MERN stack with additional libraries and services for authentication, QR code generation, file uploads, and email functionality.

1. Frontend Technologies

Technology          Version          Purpose
React               ^18.2.0          Building the user interface
React DOM           ^18.2.0          Rendering React components
Vite                ^5.2.8           Development server and build tool
React Router DOM    ^6.22.3          Client-side navigation
Axios               ^1.6.8           API communication
Tailwind CSS        ^3.4.3           Styling and responsive design
Lucide React        ^0.364.0         Icons

2. Backend Technologies

Technology          Version          Purpose
Node.js             Runtime          Executing backend JavaScript
Express.js          ^4.19.2          Building REST APIs
MongoDB             Database         Storing application data
Mongoose            ^8.3.1           MongoDB object modeling
JSON Web Token      ^9.0.2           User authentication
bcryptjs            ^2.4.3           Password hashing
Multer              ^1.4.5-lts.1     Handling file uploads
Cloudinary          ^2.1.0           Cloud-based file storage
Nodemailer          ^6.9.13          Email functionality
QRCode              ^1.5.3           Generating equipment QR codes

3. Security and Middleware

Technology          Version          Purpose
CORS                ^2.8.5           Managing cross-origin requests
Helmet              ^8.3.0           Setting HTTP security headers
Express Rate Limit  ^8.7.3           Limiting repeated API requests
Express Validator   ^7.3.2           Validating request data
Morgan              ^1.12.1          HTTP request logging
dotenv              ^16.4.5          Managing environment variables

4. Development Tools

Tool                Purpose

Visual Studio Code  Code editing
Git and GitHub      Version control and source code hosting
Postman             API testing
Nodemon             Automatic server restart during development

5. Project Architecture

The application follows a client-server architecture:
Frontend: React-based user interface.
Backend: Node.js and Express.js REST API.
Database: MongoDB managed through Mongoose.
Communication: Frontend communicates with backend APIs using Axios.
Authentication: JWT-based authentication with hashed passwords.
File Storage: Cloudinary for uploaded files.

