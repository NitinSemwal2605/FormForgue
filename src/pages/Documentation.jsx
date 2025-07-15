import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const sections = [
  { id: 'filestructure', label: 'File Structure' },
  { id: 'idea', label: 'Project Idea' },
  { id: 'data', label: 'Data Models' },
  { id: 'apis', label: 'API Endpoints' },
  { id: 'build', label: 'Build Process' },
];

export default function Documentation() {
  const [active, setActive] = useState('filestructure');

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-gray-900/90 border-r border-gray-800 p-6 flex flex-col gap-6 fixed top-0 left-0 h-full z-40">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Docs</h2>
        <nav className="flex flex-col gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActive(section.id)}
              className={`text-left px-4 py-2 rounded-lg transition-all font-medium ${active === section.id ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-gray-800/80 text-gray-200'}`}
            >
              {section.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto">
          <Link to="/">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-bold text-base transition-all duration-300 shadow-lg">
              Back to Home
            </Button>
          </Link>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto py-12 px-6 ml-64">
        {active === 'filestructure' && (
          <section>
            <h1 className="text-3xl font-bold mb-4 text-blue-400">File Structure</h1>
            <img src="/docs-file-structure.png" alt="Project File Structure Example" className="rounded-lg mb-4 border border-gray-700 shadow-lg w-full max-w-xl mx-auto" />
            <p className="text-center text-gray-400 text-xs mb-6">Example: Visual representation of the project file structure.</p>
            <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto mb-4">
{`
FormForge/
  ├── backend/
  │   ├── models/
  │   │   ├── Form.js
  │   │   ├── Response.js
  │   │   └── User.js
  │   ├── routes/
  │   │   ├── auth.js
  │   │   ├── forms.js
  │   │   └── responses.js
  │   ├── middleware/
  │   │   └── auth.js
  │   ├── server.js
  │   └── ...
  ├── src/
  │   ├── components/
  │   ├── contexts/
  │   ├── pages/
  │   ├── services/
  │   ├── App.jsx
  │   ├── main.jsx
  │   └── ...
  ├── public/
  ├── package.json
  └── ...
`}
            </pre>
            <p className="text-gray-300 mb-4">This structure separates backend and frontend for clarity and scalability. <b>backend/</b> contains all server-side logic, models, and API routes. <b>src/</b> contains all React components, pages, and context providers.</p>
            <ul className="list-disc list-inside text-gray-200 space-y-2 mb-4">
              <li><b>models/</b>: Mongoose schemas for MongoDB collections.</li>
              <li><b>routes/</b>: Express route handlers for API endpoints.</li>
              <li><b>middleware/</b>: Custom Express middleware (e.g., authentication).</li>
              <li><b>components/</b>: Reusable React UI components.</li>
              <li><b>contexts/</b>: React context providers for global state (auth, theme, toast, etc.).</li>
              <li><b>pages/</b>: Top-level React pages (Dashboard, Auth, Documentation, etc.).</li>
              <li><b>services/</b>: API utility functions for frontend-backend communication.</li>
            </ul>
            <h2 className="text-xl font-semibold mt-8 mb-2 text-purple-400">Example: Adding a New Page</h2>
            <ol className="list-decimal list-inside text-gray-200 space-y-1 mb-4">
              <li>Create a new file in <b>src/pages/</b> (e.g., <code>About.jsx</code>).</li>
              <li>Add your component and export it.</li>
              <li>Register the route in <code>App.jsx</code>.</li>
              <li>Link to it from the sidebar or navigation.</li>
            </ol>
          </section>
        )}
        {active === 'idea' && (
          <section>
            <h1 className="text-3xl font-bold mb-4 text-blue-400">Project Idea</h1>
            <img src="/docs-idea.png" alt="Project Idea Illustration" className="rounded-lg mb-4 border border-gray-700 shadow-lg w-full max-w-xl mx-auto" />
            <p className="text-center text-gray-400 text-xs mb-6">Illustration: The vision and use cases for FormForge.</p>
            <p className="text-gray-300 mb-4">FormForge is a full-stack, modern form builder platform. The vision is to empower users to create, share, and analyze forms with a beautiful, intuitive UI and robust backend. <b>Key goals:</b></p>
            <ul className="list-disc list-inside text-gray-200 space-y-2 mb-4">
              <li>Drag-and-drop form builder for all skill levels</li>
              <li>Customizable fields, themes, and branding</li>
              <li>Real-time analytics and response management</li>
              <li>Secure user authentication and privacy</li>
              <li>Team collaboration and role-based permissions</li>
              <li>Scalable, modular codebase for easy extension</li>
            </ul>
            <h2 className="text-xl font-semibold mt-8 mb-2 text-purple-400">User Stories</h2>
            <ul className="list-disc list-inside text-gray-200 space-y-1 mb-4">
              <li>As a user, I can register and log in securely.</li>
              <li>As a user, I can create forms with various field types.</li>
              <li>As a user, I can share forms and collect responses.</li>
              <li>As a user, I can view analytics and export data.</li>
              <li>As an admin, I can manage users and forms.</li>
            </ul>
            <h2 className="text-xl font-semibold mt-8 mb-2 text-purple-400">Design Principles</h2>
            <ul className="list-disc list-inside text-gray-200 space-y-1 mb-4">
              <li>Minimal, modern UI with dark mode</li>
              <li>Mobile-first, responsive design</li>
              <li>Security-first: encrypted passwords, JWT, validation</li>
              <li>Accessible and easy to use for everyone</li>
            </ul>
          </section>
        )}
        {active === 'data' && (
          <section>
            <h1 className="text-3xl font-bold mb-4 text-blue-400">Data Models</h1>
            <h2 className="text-xl font-semibold mt-6 mb-2 text-purple-400">User Model (backend/models/User.js)</h2>
            <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto mb-2">{`
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date
})
`}</pre>
            <h2 className="text-xl font-semibold mt-6 mb-2 text-purple-400">Form Model (backend/models/Form.js)</h2>
            <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto mb-2">{`
const FormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  fields: [
    {
      type: { type: String, required: true },
      label: String,
      placeholder: String,
      options: [String],
      required: Boolean
    }
  ],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})
`}</pre>
            <h2 className="text-xl font-semibold mt-6 mb-2 text-purple-400">Response Model (backend/models/Response.js)</h2>
            <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto mb-2">{`
const ResponseSchema = new mongoose.Schema({
  form: { type: mongoose.Schema.Types.ObjectId, ref: 'Form' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: [
    {
      fieldId: String,
      value: mongoose.Schema.Types.Mixed
    }
  ],
  submittedAt: { type: Date, default: Date.now }
})
`}</pre>
            <h2 className="text-xl font-semibold mt-8 mb-2 text-purple-400">Best Practices</h2>
            <ul className="list-disc list-inside text-gray-200 space-y-1 mb-4">
              <li>Always hash passwords before saving (bcrypt).</li>
              <li>Validate all user input on both frontend and backend.</li>
              <li>Use references for relationships (user → forms, form → responses).</li>
              <li>Keep models modular and reusable.</li>
            </ul>
          </section>
        )}
        {active === 'apis' && (
          <section>
            <h1 className="text-3xl font-bold mb-4 text-blue-400">API Endpoints</h1>
            <h2 className="text-xl font-semibold mt-6 mb-2 text-purple-400">Authentication</h2>
            <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto mb-2">{`
POST   /api/auth/register        // Register new user
POST   /api/auth/login           // Login, returns JWT
GET    /api/auth/profile         // Get current user profile
POST   /api/auth/change-password // Change password
`}</pre>
            <h2 className="text-xl font-semibold mt-6 mb-2 text-purple-400">Forms</h2>
            <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto mb-2">{`
GET    /api/forms                // List all forms for user
POST   /api/forms                // Create new form
GET    /api/forms/:id            // Get form details
PUT    /api/forms/:id            // Update form
DELETE /api/forms/:id            // Delete form
`}</pre>
            <h2 className="text-xl font-semibold mt-6 mb-2 text-purple-400">Responses</h2>
            <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto mb-2">{`
POST   /api/responses/submit     // Submit a form response
GET    /api/responses/:formId    // Get all responses for a form
DELETE /api/responses/:id        // Delete a response
`}</pre>
            <h2 className="text-xl font-semibold mt-8 mb-2 text-purple-400">Example: Creating a Form (Frontend)</h2>
            <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto mb-2">{`
// src/services/api.js
export async function createForm(data) {
  return fetch('/api/forms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer YOUR_TOKEN_HERE' },
    body: JSON.stringify(data)
  }).then(res => res.json())
}
`}</pre>
            <h2 className="text-xl font-semibold mt-8 mb-2 text-purple-400">API Security & Tips</h2>
            <ul className="list-disc list-inside text-gray-200 space-y-1 mb-4">
              <li>Always send JWT in the <code>Authorization</code> header.</li>
              <li>Validate and sanitize all incoming data.</li>
              <li>Handle errors gracefully and return clear messages.</li>
              <li>Use HTTPS in production for all API calls.</li>
            </ul>
            <h2 className="text-xl font-semibold mt-8 mb-2 text-purple-400">Authentication Flow (Diagram)</h2>
            <p className="text-gray-300 mb-2">This flowchart shows the steps for user registration and login:</p>
            <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto mb-4">{`
flowchart TD
  A[User submits form] --> B[POST /api/auth/register or /api/auth/login]
  B --> C{Valid credentials?}
  C -- Yes --> D[JWT issued]
  C -- No --> E[Error message]
  D --> F[Frontend stores token]
  F --> G[User authenticated]
`}</pre>
            <h2 className="text-xl font-semibold mt-8 mb-2 text-purple-400">Form Creation Flow (Diagram)</h2>
            <p className="text-gray-300 mb-2">This diagram illustrates the process of building and saving a form:</p>
            <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto mb-4">{`
flowchart LR
  A[User drags field] --> B[Field added to form state]
  B --> C[User customizes field]
  C --> D[Clicks Save]
  D --> E[POST /api/forms]
  E --> F[Form saved in DB]
  F --> G[Form appears in dashboard]
`}</pre>
            <h2 className="text-xl font-semibold mt-8 mb-2 text-purple-400">Data Flow (Diagram)</h2>
            <p className="text-gray-300 mb-2">How data moves from the user to the database and back:</p>
            <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto mb-4">{`
flowchart TD
  User -->|fills form| Frontend
  Frontend -->|POST /api/forms| Backend
  Backend -->|save| MongoDB
  MongoDB --> Backend
  Backend -->|response| Frontend
  Frontend -->|shows| User
`}</pre>
          </section>
        )}
        {active === 'build' && (
          <section>
            <h1 className="text-3xl font-bold mb-4 text-blue-400">Build Process</h1>
            <img src="/docs-form-builder.png" alt="Form Builder Screenshot" className="rounded-lg mb-4 border border-gray-700 shadow-lg w-full max-w-xl mx-auto" />
            <p className="text-center text-gray-400 text-xs mb-6">Screenshot: The drag-and-drop form builder in action.</p>
            <h2 className="text-xl font-semibold mt-6 mb-2 text-purple-400">Step-by-Step</h2>
            <ol className="list-decimal list-inside text-gray-200 space-y-2 mb-4">
              <li><b>Backend Setup:</b> Initialize Node.js project, install Express, Mongoose, bcrypt, JWT, and CORS. Set up MongoDB connection.</li>
              <li><b>Define Models:</b> Create Mongoose schemas for User, Form, and Response.</li>
              <li><b>API Routes:</b> Implement RESTful routes for authentication, forms, and responses.</li>
              <li><b>Frontend Setup:</b> Initialize React project with Vite, install Tailwind CSS, set up routing and context providers.</li>
              <li><b>UI Components:</b> Build reusable components (Button, Card, Input, etc.).</li>
              <li><b>Form Builder:</b> Implement drag-and-drop logic, field configuration, and live preview.</li>
              <li><b>Analytics:</b> Add charts and stats for form responses.</li>
              <li><b>Testing:</b> Test all features, handle edge cases, and fix bugs.</li>
              <li><b>Deployment:</b> Deploy backend (e.g., Render, Heroku), frontend (Vercel, Netlify), and set up environment variables securely.</li>
            </ol>
            <h2 className="text-xl font-semibold mt-8 mb-2 text-purple-400">Architecture Diagram (ASCII)</h2>
            <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto mb-2">{`
[User] ⇄ [React Frontend] ⇄ [Express API] ⇄ [MongoDB]
`}</pre>
            <h2 className="text-xl font-semibold mt-8 mb-2 text-purple-400">Troubleshooting & Tips</h2>
            <ul className="list-disc list-inside text-gray-200 space-y-1 mb-4">
              <li>Check browser console and server logs for errors.</li>
              <li>Ensure MongoDB is running and accessible.</li>
              <li>Use Postman to test API endpoints independently.</li>
              <li>Keep dependencies up to date and secure.</li>
              <li>Read the code comments for extra guidance.</li>
            </ul>
          </section>
        )}
      </main>
    </div>
  );
} 