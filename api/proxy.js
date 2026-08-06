export default async function handler(req, res) {
    // Sadece POST isteklerine izin ver
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Sadece POST metoduna izin verilir' });
    }
  
    try {
      // Frontend'den gelen isteğin gövdesinden veriyi (data) al
      const { data } = req.body;
  
      if (!data) {
        return res.status(400).json({ error: 'Gönderilecek veri (data) eksik.' });
      }
  
      // Vercel'de ayarlayacağımız Environment Variable'dan TOKEN'ı al
      const token = process.env.KUSTOM_TOKEN;
  
      if (!token) {
          return res.status(500).json({ error: 'Sunucuda Kustom Token ayarlanmamış. Lütfen Vercel ayarlarını kontrol edin.' });
      }
  
      // Kustom API'sinin beklediği tam formatı (payload) oluştur
      const kustomPayload = {
        tokens: [token],
        data: data
      };
  
      // Kustom API'sine asıl isteği yap 
      // DİKKAT: 429 Engelini aşmak için Chrome tarayıcısı kimliğine bürünüyoruz (User-Agent)
      const kustomResponse = await fetch('https://api.kustom.rocks/msg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Connection': 'keep-alive'
        },
        body: JSON.stringify(kustomPayload)
      });
  
      // Kustom API'sinden dönen sonuca göre frontend'e cevap ver
      if (kustomResponse.ok) {
          return res.status(200).json({ success: true, message: 'Veri Kustom API\'sine başarıyla iletildi' });
      } else {
          const errorText = await kustomResponse.text();
          return res.status(kustomResponse.status).json({ success: false, error: errorText });
      }
  
    } catch (error) {
      return res.status(500).json({ error: 'Proxy sunucu hatası: ' + error.message });
    }
}