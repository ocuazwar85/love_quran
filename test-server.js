const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
// Menyesuaikan path ke file doa.json berdasarkan struktur folder yang terlihat
const DATA_FILE = path.join(__dirname, 'src', 'lib', 'doa.json');

console.log('--- INFO DEBUG ---');
console.log('Lokasi Script:', __dirname);
console.log('Target File JSON:', DATA_FILE);

if (!fs.existsSync(DATA_FILE)) {
  console.error('PERINGATAN: File doa.json TIDAK DITEMUKAN di path tersebut!');
  console.error('Pastikan struktur folder: src/lib/doa.json ada di dalam folder yang sama dengan script ini.');
} else {
  console.log('Status File: Ditemukan ✅');
}
console.log('------------------');

const server = http.createServer((req, res) => {
  // Endpoint API untuk mengambil data JSON
  if (req.url === '/api/doa') {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Gagal membaca file data: ' + err.message }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    });
  } 
  // Halaman utama untuk menampilkan data
  else if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tes Data Doa</title>
        <style>
          body { font-family: sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; background-color: #f9f9f9; }
          .doa-item { background: white; border: 1px solid #ddd; margin-bottom: 15px; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
          .kategori { font-size: 0.8em; color: #007bff; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 5px; }
          h3 { margin-top: 0; color: #333; }
          .arabic { font-size: 1.8em; direction: rtl; margin: 15px 0; font-family: "Traditional Arabic", serif; color: #000; line-height: 1.6; }
          .latin { color: #555; font-style: italic; margin-bottom: 5px; }
          .arti { color: #333; }
        </style>
      </head>
      <body>
        <h1>Daftar Doa Harian</h1>
        <div id="container">Memuat data...</div>
        <script>
          fetch('/api/doa')
            .then(response => response.json())
            .then(data => {
              const container = document.getElementById('container');
              container.innerHTML = data.map(item => \`
                <div class="doa-item">
                  <div class="kategori">\${item.kategori}</div>
                  <h3>\${item.doa}</h3>
                  <div class="arabic">\${item.ayat}</div>
                  <p class="latin">\${item.latin}</p>
                  <p class="arti">\${item.artinya}</p>
                </div>
              \`).join('');
            })
            .catch(err => {
              console.error(err);
              document.getElementById('container').innerText = 'Gagal memuat data. Pastikan server berjalan dan file json tersedia.';
            });
        </script>
      </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`ERROR: Port ${PORT} sedang digunakan.`);
    console.error('Solusi: Tutup terminal lain yang menjalankan server ini, atau ubah angka PORT di dalam file test-server.js (misal jadi 3001).');
  } else {
    console.error('Server Error:', e);
  }
});

server.listen(PORT, () => {
  console.log(\`Server berjalan di http://localhost:\${PORT}\`);
  console.log('Tekan Ctrl+C untuk berhenti.');
});