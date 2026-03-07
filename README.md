# Hexagon Canvas

A web-based interactive hexagon grid canvas application that lets you create patterns and designs using hexagonal tiles.

## Features

- **Interactive Hexagon Grid**: Click hexagons to toggle them on/off
- **Configurable Grid Size**: Set custom width and height for your canvas
- **Text Support**: Double-click any active hexagon to add text that auto-sizes to fit
- **Customization Options**:
  - Active/inactive hexagon colors
  - Border color and width
  - Text color and font family
  - Background color
  - Show/hide inactive hexagons
- **Export to PNG**: Download your creation as a polished PNG image (only includes active hexagons, no UI elements)

## Usage

1. **Toggle Hexagons**: Click any hexagon to turn it on (activate it)
2. **Add Text**: Double-click an active hexagon to enter text
3. **Customize**: Use the sidebar controls to adjust colors, sizes, and styles
4. **Export**: Click "Export as PNG" to download your creation

## Local Development

To run locally, simply serve the files with any static file server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js (with npx)
npx serve

# Using PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in your browser.

## Deployment to GitHub Pages

This project is designed to be deployed to GitHub Pages:

1. Push the code to a GitHub repository
2. Go to Repository Settings → Pages
3. Under "Source", select "Deploy from a branch"
4. Select the `main` branch and `/ (root)` folder
5. Click Save

Your site will be available at `https://<username>.github.io/<repository-name>/`

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling for the UI and hexagon grid
- `app.js` - JavaScript application logic

## Technologies

Built with vanilla HTML, CSS, and JavaScript - no frameworks or build tools required!
