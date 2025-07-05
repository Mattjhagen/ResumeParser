# Project Analysis

This project is a web application that allows users to generate a personal "about me" website from their resume. It uses a Node.js backend with Express.js, and leverages several third-party services:

- **Authentication:** LinkedIn OAuth is used for user authentication, with user data stored in Supabase.
- **Resume Processing:** Users can upload their resumes in PDF format. The backend extracts the text content from the PDF and uses OpenAI's GPT-4 to generate an HTML "about me" page.
- **Payments:** Stripe is integrated to handle payments for a "Pro" version of the site, which likely includes premium features like a custom domain.
- **Deployment:** The project is configured for deployment on both Render and Cloudflare Pages, with separate CI/CD workflows for each.

## Project Structure

- `server.js`: The main entry point for the Node.js/Express application.
- `routes/`: Contains the API route handlers for authentication, file uploads, and payments.
- `lib/`: Includes helper modules for interacting with Supabase (`supabase.js`) and processing PDFs (`pdf.js`).
- `public/`: Holds the static assets for the frontend, including HTML, CSS, and images. The `generated/` subdirectory is used to store the AI-generated HTML pages.
- `middleware/`: Contains Express middleware, such as the logger.
- `wrangler.toml`: Configuration file for Cloudflare Workers.
- `render.yaml`: Configuration file for deployment on Render.
- `.github/workflows/`: Contains the CI/CD workflows for deploying to Cloudflare Pages and Render.
- `package.json`: Defines the project's dependencies and scripts.
