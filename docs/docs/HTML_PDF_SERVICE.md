# HTML-PDF Service Documentation

This service provides a high-fidelity HTML-to-PDF conversion engine using Headless Chrome (Puppeteer). It is designed to handle complex layouts, CSS, and dynamic data for generating professional documents like quotes, contracts, and business profiles.

## 1. Hosting & Environment

The service is hosted in a Docker container for environment consistency and ease of deployment.

- **Container Name:** `HTML-PDF`
- **Host Port:** `4587`
- **Internal Port:** `4587`
- **Base Image:** `ghcr.io/puppeteer/puppeteer` (Official stable image)
- **Restart Policy:** `always`

### Management Commands
Run these commands from `/Users/lucas/Documents/Bespoke/Bonram-rentals/services/html-pdf`:

```bash
# Start or Restart the service
docker-compose up -d --build

# Stop the service
docker-compose down

# View live logs
docker logs -f HTML-PDF
```

---

## 2. API Reference

The service exposes a single REST endpoint for PDF generation.

### `POST /generate-pdf`

Generates a PDF from an HTML template and optional data.

#### Request Body (JSON)

| Field       | Type     | Description                                                                                    |
| :---------- | :------- | :--------------------------------------------------------------------------------------------- |
| `template`  | `string` | The HTML content. Prefix with `base64:` to send encoded content (recommended for large files). |
| `data`      | `object` | Key-value pairs used to populate Handlebars placeholders in the template.                      |
| `filename`  | `string` | The name of the resulting file (e.g., `invoice_001.pdf`).                                      |
| `subfolder` | `string` | (Optional) A sub-directory name to organize files (e.g., `quotes`).                            |

#### Example Request (JSON)

```json
{
  "template": "<h1>Hello {{name}}</h1>",
  "data": { "name": "Lucas" },
  "filename": "hello_world.pdf",
  "subfolder": "test"
}
```

---

## 3. Output & Storage

All generated PDFs are stored on the host machine via a Docker volume mapping.

- **Host Path:** `/Users/lucas/Documents/Bespoke/generated_docs`
- **Container Path:** `/home/pptruser/output`

The service automatically creates subdirectories if they do not exist.

---

## 4. Usage Examples

### Shell (CURL)
```bash
curl -X POST http://localhost:4587/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "template": "base64:PGgxPkhlbGxvPC9oMT4=", 
    "filename": "test.pdf"
  }'
```

### Node.js (JavaScript)
```javascript
const postData = JSON.stringify({
    template: 'base64:' + Buffer.from('<html>...</html>').toString('base64'),
    data: { id: 123 },
    filename: 'document.pdf',
    subfolder: 'client_a'
});

// Send via http.request or fetch to http://localhost:4587/generate-pdf
```

---

## 5. Implementation Notes
- **Handlebars Support:** You can use `{{variable}}` in your HTML to inject data.
- **Base64 Encoding:** Highly recommended to avoid JSON parsing errors with large HTML templates containing special characters or quotes.
- **Rendering:** Uses `networkidle0` to ensure all assets (fonts, images) are loaded before the PDF is captured.
