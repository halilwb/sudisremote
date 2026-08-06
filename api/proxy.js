// api/proxy.js
export default async function handler(req, res) {
  // 1. Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST metoduna izin verilir' });
  }

  try {
    // 2. Frontend'den gelen veriyi (data) al
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Gönderilecek veri (data) eksik.' });
    }

    // 3. Ortam değişkenlerinden (Environment Variables) güvenli bir şekilde TOKEN'ı al
    // process.env.KUSTOM_TOKEN değerini Vercel panelinden ayarlayacağız.
    const token = process.env.KUSTOM_TOKEN;

    if (!token) {
        return res.status(500).json({ error: 'Sunucuda Token ayarlanmamış.' });
    }

    // 4. Kustom API'sine asıl isteği yapacak olan payload'u hazırla
    const kustomPayload = {
      tokens: [token],
      data: data
    };

    // 5. Kustom API'sine isteği at
    const kustomResponse = await fetch('https://api.kustom.rocks/msg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(kustomPayload)
    });

    // 6. Kustom'dan dönen sonucu kendi Frontend'imize geri döndür
    if (kustomResponse.ok) {
        return res.status(200).json({ success: true, message: 'Başarıyla iletildi' });
    } else {
        const errorText = await kustomResponse.text();
        return res.status(kustomResponse.status).json({ success: false, error: errorText });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Proxy sunucu hatası: ' + error.message });
  }
}