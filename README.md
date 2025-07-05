# Resume Portfolio Generator

This project provides a standalone Node.js script to parse a resume (plain text) and generate a personalized, embeddable HTML portfolio page using AI.

## Features

- Extracts key information (name, title, experience, skills, education, contact) from a resume.
- Infers industry, primary role, and personality from the resume text using the Gemini API.
- Generates a visually appealing HTML portfolio page with dynamic styling based on inferred personality/industry.
- Designed for easy embedding into other websites using an `<iframe>`.

## Setup and Usage

### Prerequisites

- Node.js (v18 or higher recommended)
- A Gemini API Key (from Google AI Studio)

### Installation

1.  **Clone this repository:**
    ```bash
    git clone https://github.com/vibeCodesSpace/resume-parser.git
    cd resume-parser
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd resume-portfolio-generator
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

### Configuration

Set your Gemini API Key as an environment variable. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual key.

```bash
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
```

Alternatively, you can directly embed the API key in `generate-portfolio.js` (less secure for public repositories):

```javascript
const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY_HERE");
```

### Running the Generator

To generate a portfolio, run the `generate-portfolio.js` script with the path to your plain text resume file:

```bash
node generate-portfolio.js <path-to-your-resume-file.txt>
```

**Example:**

```bash
node generate-portfolio.js ~/downloads/Matthew\ Hagen.txt
```

The script will output an HTML file (e.g., `your-name-portfolio.html`) in the same directory.

## Embedding the Portfolio

Once you have generated your portfolio HTML file, you can embed it into any other website using an `<iframe>`.

1.  **Host the Generated HTML File:**
    The generated HTML file (e.g., `matthew-hagen-portfolio.html`) needs to be accessible via a web server. You can:
    *   Upload it to a web hosting service.
    *   Use a service like GitHub Pages for your repository. If you enable GitHub Pages for this repository, the HTML file will be accessible at a URL like `https://vibeCodesSpace.github.io/resume-parser/matthew-hagen-portfolio.html` (assuming it's in the root of your `gh-pages` branch or `docs` folder).

2.  **Embed using an `<iframe>`:**
    In your target website's HTML, add the following `<iframe>` tag. Replace `YOUR_PUBLIC_URL_TO_PORTFOLIO.html` with the actual public URL where your portfolio HTML file is hosted.

    ```html
    <iframe 
        src="YOUR_PUBLIC_URL_TO_PORTFOLIO.html" 
        width="100%" 
        height="800px" 
        frameborder="0" 
        allowfullscreen
    ></iframe>
    ```

    Adjust `width` and `height` as needed to fit your embedding site's layout.

## Contributing

Feel free to fork this repository, open issues, and submit pull requests.
