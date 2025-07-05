# Resume Portfolio Generator API

This project is a Node.js web server that uses AI to generate a personalized HTML portfolio page from resume text.

## Features

- Provides an API endpoint to convert resume text into a full HTML portfolio page.
- Uses OpenAI's GPT-4 for content generation.
- Includes routes for user authentication (via Supabase), file uploads, and payments (via Stripe), though these are not required for the core portfolio generation.

## Setup and Usage

### Prerequisites

- Node.js (v18 or higher recommended)
- An OpenAI API Key
- A Supabase project for URL and Key (optional, for auth features)

### Installation

1.  **Clone this repository:**
    ```bash
    git clone https://github.com/Mattjhagen/ResumeParser.git
    cd ResumeParser
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Configuration

1.  Create a `.env` file in the root of the project.
2.  Add your environment variables to the `.env` file. At a minimum, you need an OpenAI API key.

    ```env
    # Required for generating the portfolio
    OPENAI_API_KEY="sk-..."

    # Optional: Required for authentication features
    SUPABASE_URL="https://your-project-ref.supabase.co"
    SUPABASE_KEY="your-supabase-anon-key"
    ```

### Running the Server

Start the server with the following command:

```bash
node server.js
```

The server will start on port 3000.

## Testing the Generator

You can test the portfolio generation endpoint using a tool like `curl`.

1.  Make sure the server is running.
2.  Open a new terminal and run the following command. This will send a sample resume to the API, and save the generated HTML into a file named `portfolio.html`.

    ```bash
    curl -X POST http://localhost:3000/generate-portfolio \
    -H "Content-Type: application/json" \
    -d '{
      "resumeText": "John Doe\nSoftware Engineer\n\nExperience:\n- Software Engineer at Google (2020-Present)\n- Software Engineer Intern at Facebook (2019)\n\nEducation:\n- B.S. in Computer Science from Stanford University (2020)\n\nSkills:\n- JavaScript, Python, Java, C++"
    }' \
    -o portfolio.html
    ```

3.  You will now have a `portfolio.html` file in your current directory. You can open this file in a web browser to see the result.

## Embedding the Portfolio

The generated `portfolio.html` file is a complete, self-contained web page. To embed it into another website, you first need to host it online.

1.  **Host the HTML File:**
    Upload the `portfolio.html` file to a web hosting service. Some free options include:
    *   [GitHub Pages](https://pages.github.com/)
    *   [Netlify Drop](https://app.netlify.com/drop)
    *   [Vercel](https://vercel.com/)

2.  **Embed using an `<iframe>`:**
    Once your file is hosted and you have a public URL, you can embed it in any other website using an `<iframe>`. Add the following HTML to your target site, replacing `YOUR_PUBLIC_URL_TO_PORTFOLIO.html` with the actual URL.

    ```html
    <iframe 
        src="YOUR_PUBLIC_URL_TO_PORTFOLIO.html" 
        width="100%" 
        height="800px" 
        frameborder="0" 
        allowfullscreen
    ></iframe>
    ```

    Adjust the `width` and `height` attributes as needed to fit your site's layout.