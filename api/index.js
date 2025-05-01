const express = require('express');
const { search, ytmp3, ytmp4, ytdlv2 } = require('@vreden/youtube_scraper');
const serverless = require('serverless-http');

const app = express();
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(getHtml(null, null, null));
});

app.post('/download', async (req, res) => {
    const { url, type, quality } = req.body;
    let downloadFunction;

    try {
        if (type === 'mp3') {
            downloadFunction = ytmp3;
        } else if (type === 'mp4') {
            downloadFunction = ytmp4;
        } else {
            downloadFunction = ytdlv2;
        }

        const result = await downloadFunction(url, quality);
        if (result.status) {
            res.send(getHtml(result.download, result.metadata, null));
        } else {
            res.send(getHtml(null, null, result.result));
        }
    } catch (err) {
        res.send(getHtml(null, null, 'Error al procesar la solicitud'));
    }
});

function getHtml(downloadLink, metadata, error) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Descargador de YouTube</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #6B46C1, #E53E3E);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow-x: hidden;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 2.5rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            max-width: 28rem;
            width: 100%;
            transform: translateY(0);
            animation: slideUp 0.5s ease-out;
        }
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        h1 {
            color: #2D3748;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        input, select {
            transition: all 0.3s ease;
            border: 2px solid #E2E8F0;
            background: #F7FAFC;
        }
        input:focus, select:focus {
            border-color: #6B46C1;
            box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.2);
            background: #FFFFFF;
        }
        button {
            background: linear-gradient(to right, #6B46C1, #E53E3E);
            position: relative;
            overflow: hidden;
            transition: transform 0.3s ease;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(107, 70, 193, 0.4);
        }
        button::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.2);
            transition: left 0.4s ease;
        }
        button:hover::after {
            left: 100%;
        }
        .error, .success {
            animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .icon {
            display: inline-block;
            animation: bounce 2s infinite;
        }
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="text-3xl font-bold text-center mb-8">
            <span class="icon">🎵</span> Descargador de YouTube <span class="icon">🎥</span>
        </h1>
        
        <form action="/api/download" method="POST" class="space-y-6">
            <div>
                <label for="url" class="block text-sm font-medium text-gray-700 mb-1">URL de YouTube</label>
                <input type="text" id="url" name="url" required
                    class="block w-full rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none">
            </div>

            <div>
                <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                <select id="type" name="type" required
                    class="block w-full rounded-xl px-4 py-3 text-gray-900 focus:outline-none">
                    <option value="mp3">MP3 (Audio) 🎧</option>
                    <option value="mp4">MP4 (Video) 📹</option>
                    <option value="ytdlv2">Ambos (YTDLV2) 🤖</option>
                </select>
            </div>

            <div>
                <label for="quality" class="block text-sm font-medium text-gray-700 mb-1">Calidad</label>
                <select id="quality" name="quality" required
                    class="block w-full rounded-xl px-4 py-3 text-gray-900 focus:outline-none">
                    <option value="64" data-type="mp3">64 kbps (Audio)</option>
                    <option value="96" data-type="mp3">96 kbps (Audio)</option>
                    <option value="128" data-type="mp3">128 kbps (Audio)</option>
                    <option value="192" data-type="mp3">192 kbps (Audio)</option>
                    <option value="256" data-type="mp3">256 kbps (Audio)</option>
                    <option value="320" data-type="mp3">320 kbps (Audio)</option>
                    <option value="360" data-type="mp4">360p (Video)</option>
                    <option value="480" data-type="mp4">480p (Video)</option>
                    <option value="720" data-type="mp4">720p (Video)</option>
                    <option value="1080" data-type="mp4">1080p (Video)</option>
                </select>
            </div>

            <button type="submit"
                class="w-full text-white py-3 px-4 rounded-xl font-semibold text-lg focus:outline-none">
                Descargar Ahora
            </button>
        </form>

        ${error ? `
            <div class="error mt-6 p-4 bg-red-100 text-red-700 rounded-xl flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                ${error}
            </div>
        ` : ''}

        ${downloadLink ? `
            <div class="success mt-6 p-4 bg-green-100 text-green-700 rounded-xl">
                <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <p><strong>Enlace de descarga:</strong> <a href="${downloadLink}" class="underline font-semibold hover:text-green-900" target="_blank">Descargar</a></p>
                </div>
                ${metadata ? `
                    <p class="mt-2"><strong>Título:</strong> ${metadata.title}</p>
                    <p><strong>Duración:</strong> ${metadata.duration}</p>
                ` : ''}
            </div>
        ` : ''}
    </div>

    <script>
        const typeSelect = document.getElementById('type');
        const qualitySelect = document.getElementById('quality');

        typeSelect.addEventListener('change', () => {
            const selectedType = typeSelect.value;
            Array.from(qualitySelect.options).forEach(option => {
                const optionType = option.getAttribute('data-type');
                option.style.display = (selectedType === 'ytdlv2' || optionType === selectedType || !optionType) ? 'block' : 'none';
            });
            qualitySelect.value = selectedType === 'mp3' ? '128' : '360';
        });

        typeSelect.dispatchEvent(new Event('change'));
    </script>
</body>
</html>
    `;
}

module.exports.handler = serverless(app);
