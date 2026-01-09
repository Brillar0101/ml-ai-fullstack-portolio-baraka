# Baraka Portfolio - ML/AI Engineer

A modern, glassmorphism-styled portfolio website built with React and Vite.

## Folder Structure

```
portfolio/
├── index.html                 # Entry HTML file
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration
├── README.md                  # This file
│
└── src/
    ├── main.jsx               # React entry point
    ├── App.jsx                # Main app component with routing
    ├── config.js              # Configuration (name, contact, colors)
    │
    ├── components/
    │   ├── Navigation.jsx     # Navigation bar component
    │   └── Navigation.css     # Navigation styles
    │
    ├── data/
    │   └── projects.js        # Projects data array
    │
    ├── pages/
    │   ├── HomePage.jsx       # Home page component
    │   ├── HomePage.css       # Home page styles
    │   ├── ProjectsPage.jsx   # Projects grid page
    │   ├── ProjectsPage.css   # Projects page styles
    │   ├── ProjectDetailPage.jsx  # Individual project page
    │   ├── ProjectDetailPage.css  # Project detail styles
    │   ├── ContactPage.jsx    # Contact page component
    │   └── ContactPage.css    # Contact page styles
    │
    └── styles/
        └── global.css         # Global styles and CSS variables
```

## Setup Instructions

### 1. Download and Extract
Download the portfolio folder and place it in your desired location.

### 2. Open in VS Code
```bash
cd portfolio
code .
```

### 3. Install Dependencies
Open the terminal in VS Code (Ctrl + `) and run:
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```
The site will open at http://localhost:3000

### 5. Build for Production
```bash
npm run build
```
This creates a `dist` folder with optimized files ready for deployment.

## Customization Guide

### Change Personal Info
Edit `src/config.js`:
```javascript
export const CONFIG = {
  name: "Your Name",
  title: "Your Title",
  tagline: "Your Tagline",
  email: "your@email.com",
  // ... etc
};
```

### Add/Edit Projects
Edit `src/data/projects.js`:
```javascript
export const PROJECTS = [
  {
    id: "unique-id",
    title: "Project Title",
    shortDesc: "Short description",
    icon: IconComponent,  // Import from lucide-react
    tags: ["Tag1", "Tag2"],
    gradient: "linear-gradient(135deg, #color1 0%, #color2 100%)",
    featured: true  // or false
  },
  // ... more projects
];
```

### Change Colors
Edit the colors object in `src/config.js` or directly in `src/styles/global.css`:
```css
:root {
  --primary: #0078D4;      /* Main blue */
  --accent: #00A4EF;       /* Accent blue */
  /* ... etc */
}
```

### Add Project Content
Each project detail page currently has a placeholder. To add content, edit the `ProjectDetailPage.jsx` and create sections within the `.project-detail-content` div.

## Tech Stack
- React 18
- Vite (build tool)
- Lucide React (icons)
- CSS3 with CSS Variables
- Rubik Font (Google Fonts)

## Deployment Options
- **Vercel**: `npm i -g vercel && vercel`
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Use gh-pages package
