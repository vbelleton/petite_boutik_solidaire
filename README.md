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

## Sécurité

- Le site public ne fait que lire. Toute écriture (Firestore ou Worker) exige un admin connecté avec Google.
- Le Worker vérifie le jeton Firebase (signature, projet, expiration), puis l'existence de `admins/<email>`. Seule la lecture des images `/files/...` est publique.
- Une nouvelle collection Firestore doit être ajoutée dans `firestore.rules`, sinon elle est refusée.

## Travailler en local

```sh
npm install
npm run dev      # http://localhost:5173
npm run build
npm test         # tests Playwright
```

Le mode d'emploi pour les bénévoles est tenu à part : https://claude.ai/artifact/HL3fgE2r8yYTBAmwoxUCxZ
