# La P'tite Boutik Solidaire

Site de la boutique solidaire de l'association Bras Ouverts (Morlaix) : Vue 3 + Vite, données dans Firebase Firestore, photos stockées par un Worker Cloudflare.

## Organisation

| Élément | Rôle |
|---|---|
| `src/App.vue`, `src/components/` | Site public (accueil, calendrier, horaires, galeries, contact…) |
| `src/components/AdminPanel.vue` | Administration, à l'adresse `/admin` (connexion Google) |
| `src/components/AdminCalendar.vue` | Calendrier de l'admin : fermer, rouvrir, ouvrir exceptionnellement un jour |
| `src/composables/openingDates.js` | Calcul des dates d'ouverture, partagé par le site et l'admin |
| `src/composables/photoGallery.js` | Règle unique « Boutique » / « Articles » pour les photos |
| `src/composables/useAutoSave.js` | Enregistrement automatique dans l'admin |
| `public/manifest.webmanifest`, `public/sw.js`, `public/icons/` | Application installable (PWA) : icône sur l'écran d'accueil, secours hors connexion |
| `worker/` | Worker `petite-boutik-storage` : envoi, lecture, suppression des photos, suggestions IA |
| `firestore.rules` | Règles d'accès Firestore de référence (à coller dans la console Firebase) |

Données Firestore : `config/*` (horaires, textes, actualité, blocs, galeries), `fermetures`, `ouvertures_exceptionnelles`, `photos`, `admins` (un document par admin, identifiant = adresse e-mail en minuscules).

## Hébergement

- **Site** : Cloudflare Pages, projet `petite-boutik-solidaire`, relié à ce dépôt. Chaque push sur `main` met le site en ligne, et chaque pull request a son aperçu.
- **Worker des photos** : déployé à part, à la main, après une modification de `worker/` :
  ```sh
  cd worker
  npx wrangler login     # une seule fois
  npx wrangler deploy
  ```
  Variable facultative `ADMIN_EMAILS` (adresses séparées par des virgules) dans Workers → petite-boutik-storage → Settings → Variables.
- **Règles Firestore** : elles ne sont pas déployées automatiquement. Après une modification de `firestore.rules`, copiez son contenu dans la console Firebase (Firestore Database → Règles → Publier).

## Application installable (PWA)

Le site peut être ajouté à l'écran d'accueil (Android : « Installer l'application » dans le menu de Chrome ; iPhone : Partager → « Sur l'écran d'accueil »). Le service worker `public/sw.js` demande toujours les pages au réseau d'abord, donc le contenu reste à jour ; le cache ne sert que sans connexion. Les données (Firestore) et les photos (Worker) ne passent jamais par lui, et l'admin n'est pas concerné. Si le comportement du cache doit changer, augmenter `VERSION` dans `sw.js`.

## Sécurité

- Le site public ne fait que lire. Toute écriture (Firestore ou Worker) exige un admin connecté avec Google.
- Le Worker vérifie le jeton Firebase (signature, projet, expiration), puis l'existence de `admins/<email>`. Seule la lecture des images `/files/...` est publique.
- Une nouvelle collection Firestore doit être ajoutée dans `firestore.rules`, sinon elle est refusée.

## Garde-fous et sauvegarde

- `npm run build` vérifie ensuite la taille des fichiers (`scripts/check-dist-size.js`) : alerte au-delà de 22 Mio, échec au-delà de 25 Mio, la limite de Cloudflare Pages.
- Admin → onglet Admins → **Télécharger une sauvegarde** : export JSON de toutes les collections Firestore.
- Référencement : `public/robots.txt`, `public/sitemap.xml`, et la fiche « commerce local » (`index.html`, `#ld-business`), complétée par les prochaines dates d'ouverture (`src/composables/useLocalBusinessJsonLd.js`).

## Travailler en local

```sh
npm install
npm run dev      # http://localhost:5173
npm run build
npm test         # tests Playwright
```

Le mode d'emploi pour les bénévoles est tenu à part : https://claude.ai/artifact/HL3fgE2r8yYTBAmwoxUCxZ

## Adresse : sous /boutik/

Le site est servi sous `/boutik/` (`vite.config.js` → `base`, sortie `dist/boutik/`), pour vivre à `brasouverts.bzh/boutik` à côté du site de l'association (`vbelleton/bras-ouverts-site`, qui relaie `/boutik/*` vers ce projet Pages). Sur `petite-boutik-solidaire.pages.dev`, la racine redirige vers `/boutik/` (`racine/_redirects`).

- Toute adresse « /… » écrite en dur ou enregistrée en base passe par `chemin()` (`src/chemin.js`).
- `racine/` est copié à la racine de `dist/` après le build (`scripts/racine.js`) : `_redirects`, `_headers`, et un `sw.js` qui désinstalle l'ancien service worker des téléphones qui avaient installé l'appli avant le changement.
- Le jour où `brasouverts.bzh` est branché : l'ajouter dans Firebase → Authentication → Authorized domains (connexion à l'admin) et dans `ALLOWED_ORIGINS` du Worker photos (puis le redéployer).
