const fs = require('fs');
const path = require('path');

// HTML files to convert (place them in the same directory as this script)
const htmlFiles = {
    'index.html': 'index.ejs',
    'about.html': 'about.ejs',
    'contact.html': 'contact.ejs',
    'reservation.html': 'reservation.ejs',
    'thank-you.html': 'thank-you.ejs'
};

function convertHtmlToEjs(htmlContent) {
    // Find navigation end
    const navEndIndex = htmlContent.indexOf('</nav>');
    if (navEndIndex === -1) {
        console.log('Warning: Could not find </nav> tag');
        return htmlContent;
    }

    // Find footer start
    const footerStartIndex = htmlContent.indexOf('<footer');
    if (footerStartIndex === -1) {
        console.log('Warning: Could not find <footer> tag');
        return htmlContent;
    }

    // Extract middle content
    const middleContent = htmlContent.substring(navEndIndex + 6, footerStartIndex);

    // Extract custom styles from head
    const styleMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
    let customStyles = '';
    if (styleMatch) {
        customStyles = `<style>${styleMatch[1]}</style>\n\n`;
    }

    // Build EJS template
    let ejsContent = `<%- include('partials/header') %>\n\n${customStyles}${middleContent}\n<%- include('partials/footer') %>`;

    // Replace all HTML links with proper routes
    ejsContent = ejsContent.replace(/href="index\.html"/g, 'href="/"');
    ejsContent = ejsContent.replace(/href="about\.html"/g, 'href="/about"');
    ejsContent = ejsContent.replace(/href="contact\.html"/g, 'href="/contact"');
    ejsContent = ejsContent.replace(/href="reservation\.html"/g, 'href="/reservation"');
    ejsContent = ejsContent.replace(/href="thank-you\.html"/g, 'href="/thank-you"');
    
    // Replace image paths
    ejsContent = ejsContent.replace(/src="images\//g, 'src="/images/');
    
    // Fix form action
    ejsContent = ejsContent.replace(/action="\/submit-contact"/g, 'action="/api/contact"');
    
    // Fix JavaScript redirects
    ejsContent = ejsContent.replace(/window\.location\.href = ['"]thank-you\.html['"]/g, 'window.location.href = \'/thank-you\'');
    ejsContent = ejsContent.replace(/window\.location\.href = ['"]index\.html['"]/g, 'window.location.href = \'/\'');

    return ejsContent;
}

console.log('🔄 Starting HTML to EJS conversion...\n');

// Process each file
Object.entries(htmlFiles).forEach(([htmlFile, ejsFile]) => {
    const htmlPath = path.join(__dirname, '..', '..', htmlFile);
    const ejsPath = path.join(__dirname, '..', 'views', ejsFile);

    try {
        // Check if HTML file exists
        if (!fs.existsSync(htmlPath)) {
            console.log(`⚠️  ${htmlFile} not found, skipping...`);
            return;
        }

        // Read HTML content
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Convert to EJS
        const ejsContent = convertHtmlToEjs(htmlContent);

        // Write EJS file
        fs.writeFileSync(ejsPath, ejsContent, 'utf8');

        console.log(`✅ Converted ${htmlFile} → views/${ejsFile}`);
    } catch (error) {
        console.error(`❌ Error converting ${htmlFile}:`, error.message);
    }
});

console.log('\n✅ Conversion complete!');
console.log('\n📝 Next steps:');
console.log('1. Review the generated EJS files in views/');
console.log('2. Copy all images to public/images/');
console.log('3. Configure .env file');
console.log('4. Start the server with: npm run dev');
