const ALLOWED_ORIGINS = [
  'https://petite-boutik-solidaire.pages.dev',
  'http://localhost:5173',
  'http://localhost:4173',
]

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://petite-boutik-solidaire.pages.dev'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    // Requis pour les pages avec Cross-Origin-Embedder-Policy: require-corp (ONNX WASM)
    'Cross-Origin-Resource-Policy': 'cross-origin',
  }
}

function errorResponse(status, message, origin) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  })
}

const MIME_TO_EXT = {
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/jpeg': 'jpg',
}

const ALLOWED_MIME_TYPES = new Set(Object.keys(MIME_TO_EXT))

async function storeImage(env, buffer, contentType, originalName) {
  const mime = (contentType || '').split(';')[0].trim().toLowerCase()
  if (!ALLOWED_MIME_TYPES.has(mime)) {
    throw new Error(`Type de fichier non autorisé : ${mime || 'inconnu'}`)
  }
  const ext = MIME_TO_EXT[mime] || 'jpg'
  const key = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  await env.PETITE_BOUTIK_IMAGES.put(key, buffer, {
    metadata: { contentType: mime, originalName },
  })
  return key
}

// ── Vérification de l'admin ────────────────────────────────────────────────
// Chaque écriture (envoi, suppression, suggestion IA) doit porter le jeton de
// connexion Google de l'admin : « Authorization: Bearer <jeton Firebase> ».
// Le jeton est vérifié ici (signature Google, projet, expiration), puis l'adresse
// e-mail doit figurer dans la collection Firestore « admins » (document dont
// l'identifiant est l'adresse) ou dans la variable ADMIN_EMAILS du Worker.
const FIREBASE_PROJECT = 'la-petite-boutik'
const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
const BOOTSTRAP_ADMINS = ['belletonv@gmail.com']

let jwksCache = { keys: null, expires: 0 }
async function getJwks() {
  if (jwksCache.keys && Date.now() < jwksCache.expires) return jwksCache.keys
  const res = await fetch(JWKS_URL)
  if (!res.ok) throw new Error('JWKS indisponible')
  const { keys } = await res.json()
  const maxAge = Number((res.headers.get('Cache-Control') || '').match(/max-age=(\d+)/)?.[1] || 3600)
  jwksCache = { keys, expires: Date.now() + maxAge * 1000 }
  return keys
}

function b64urlToBytes(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(str.length / 4) * 4, '=')
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
}

async function verifyFirebaseToken(token) {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Jeton mal formé')
  const [h, p, sig] = parts
  const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(h)))
  const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(p)))
  if (header.alg !== 'RS256') throw new Error('Algorithme refusé')
  const jwk = (await getJwks()).find(k => k.kid === header.kid)
  if (!jwk) throw new Error('Clé inconnue')
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'])
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlToBytes(sig), new TextEncoder().encode(`${h}.${p}`))
  if (!ok) throw new Error('Signature invalide')
  const now = Math.floor(Date.now() / 1000)
  if (payload.aud !== FIREBASE_PROJECT) throw new Error('Mauvais projet')
  if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT}`) throw new Error('Mauvais émetteur')
  if (!(payload.exp > now - 60) || !(payload.iat < now + 300)) throw new Error('Jeton expiré')
  if (!payload.email || payload.email_verified !== true) throw new Error('E-mail non vérifié')
  return payload
}

async function isAdminEmail(env, email, token) {
  const e = email.toLowerCase()
  const fromEnv = (env.ADMIN_EMAILS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean)
  if (BOOTSTRAP_ADMINS.includes(e) || fromEnv.includes(e)) return true
  // Document admins/<email>, lu avec le jeton de l'admin (règles Firestore appliquées)
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/admins/${encodeURIComponent(e)}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  return res.ok
}

async function requireAdmin(request, env) {
  const m = (request.headers.get('Authorization') || '').match(/^Bearer (.+)$/)
  if (!m) return 'Connexion admin requise'
  try {
    const payload = await verifyFirebaseToken(m[1])
    if (!(await isAdminEmail(env, payload.email, m[1]))) return 'Compte non autorisé'
    return null
  } catch (e) {
    return 'Connexion admin invalide : ' + e.message
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''
    const method = request.method

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) })
    }

    // Seule la lecture des images est publique ; tout le reste est réservé aux admins
    const isPublicRead = method === 'GET' && url.pathname.startsWith('/files/')
    if (!isPublicRead) {
      const denied = await requireAdmin(request, env)
      if (denied) return errorResponse(401, denied, origin)
    }

    if (method === 'POST' && url.pathname === '/upload') {
      try {
        const formData = await request.formData()
        const file = formData.get('file')
        if (!file) return errorResponse(400, 'Missing file', origin)

        if (file.size > 15 * 1024 * 1024) return errorResponse(413, 'Fichier trop lourd (15 Mo maximum)', origin)
        const buffer = await file.arrayBuffer()
        const key = await storeImage(env, buffer, file.type, file.name)
        const publicUrl = `${url.origin}/files/${key}`
        return new Response(JSON.stringify({ url: publicUrl, key }), {
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
        })
      } catch (e) {
        return errorResponse(500, e.message, origin)
      }
    }

    if (method === 'GET' && url.pathname.startsWith('/files/')) {
      const key = url.pathname.slice(7)
      if (!key) return errorResponse(400, 'Missing key', origin)

      const result = await env.PETITE_BOUTIK_IMAGES.getWithMetadata(key, 'arrayBuffer')
      if (result.value === null) return errorResponse(404, 'Not found', origin)

      const contentType = result.metadata?.contentType || 'application/octet-stream'
      return new Response(result.value, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          ...corsHeaders(origin),
        },
      })
    }

    if (method === 'DELETE' && url.pathname.startsWith('/files/')) {
      const key = url.pathname.slice(7)
      if (!key) return errorResponse(400, 'Missing key', origin)

      await env.PETITE_BOUTIK_IMAGES.delete(key)
      return new Response(JSON.stringify({ deleted: true }), {
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      })
    }

    if (method === 'POST' && url.pathname === '/suggest') {
      try {
        if (!env.AI) return errorResponse(500, 'AI binding not configured', origin)
        const { imageUrl } = await request.json()
        if (!imageUrl) return errorResponse(400, 'Missing imageUrl', origin)

        // Lire l'image depuis le KV si c'est une URL locale, sinon fetch externe
        let imgBytes
        try {
          const urlObj = new URL(imageUrl)
          if (urlObj.pathname.startsWith('/files/')) {
            const key = urlObj.pathname.slice(7)
            const buf = await env.PETITE_BOUTIK_IMAGES.get(key, 'arrayBuffer')
            if (!buf) return errorResponse(404, 'Image not found in KV', origin)
            imgBytes = [...new Uint8Array(buf)]
          } else if (/^https:\/\/res\.cloudinary\.com\//.test(imageUrl)) {
            const imgRes = await fetch(imageUrl)
            if (!imgRes.ok) return errorResponse(400, 'Cannot fetch image', origin)
            imgBytes = [...new Uint8Array(await imgRes.arrayBuffer())]
          } else {
            return errorResponse(400, 'Image hors du site', origin)
          }
        } catch (e) {
          return errorResponse(400, 'Cannot load image: ' + e.message, origin)
        }

        // Deux questions simples — le modèle LLaVA ne suit pas bien les formats JSON
        const [descRes, tagRes] = await Promise.all([
          env.AI.run('@cf/llava-hf/llava-1.5-7b-hf', {
            image: imgBytes,
            prompt: "Décris ce vêtement en une courte phrase en français (maximum 60 caractères). Réponds uniquement avec la phrase, rien d'autre.",
            max_tokens: 60,
          }),
          env.AI.run('@cf/llava-hf/llava-1.5-7b-hf', {
            image: imgBytes,
            prompt: "Liste 4 mots-clés en français qui décrivent ce vêtement, séparés par des virgules. Juste les mots, rien d'autre.",
            max_tokens: 40,
          }),
        ])

        const description = (descRes?.description || '').replace(/^["'\s]+|["'\s]+$/g, '').slice(0, 80)
        const tagsRaw = tagRes?.description || ''
        const tags = tagsRaw.split(/[,;、\n]+/).map(t => t.trim().toLowerCase().replace(/^["'.\s]+|["'.\s]+$/g, '')).filter(Boolean).slice(0, 5)

        return new Response(JSON.stringify({ description, tags }), {
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
        })
      } catch (e) {
        return errorResponse(500, e.message, origin)
      }
    }

    return errorResponse(404, 'Not found', origin)
  },
}
