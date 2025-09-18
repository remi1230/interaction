# Interaction (Vanilla JS)

Projet web en JavaScript pur (vanilla), découpé en plusieurs fichiers pour plus de lisibilité.

## 🚀 Utilisation

Par défaut, le site fonctionne en **mode développement**, en important directement chaque fichier JS séparément via des balises `<script defer>`.

### Mode développement (par défaut)

Dans `index.html`, laissez les lignes comme :

```html
<script src="js/calcul.js" defer></script>
<script src="js/glob.js" defer></script>
<script src="js/mouse.js" defer></script>
...
<script src="js/tests.js" defer></script>
```

👉 Chaque fichier est chargé séparément. Pratique pour tester rapidement et modifier le code.

---

### Mode production (bundle minifié)

Une version unique et minifiée est générée dans `dist/app.min.js`.

1. Générez le bundle :

   ```bash
   npm run build
   ```

   Cela produit `dist/app.min.js`.

2. Dans `index.html`, **commentez** les lignes des fichiers individuels et **décommentez** la ligne suivante :

   ```html
   <!-- <script src="js/calcul.js" defer></script> -->
   <!-- ... -->
   <!-- <script src="js/tests.js" defer></script> -->

   <script src="dist/app.min.js" defer></script>
   ```

👉 En production, seul le fichier minifié est servi, plus rapide à charger.

---

## 📂 Structure du projet

```
.
├── css/
├── img/
├── js/
│   ├── calcul.js
│   ├── glob.js
│   ├── mouse.js
│   ├── avatar.js
│   ├── avatars.js
│   ├── canvas.js
│   ├── modifiers.js
│   ├── grids.js
│   ├── img.js
│   ├── ui.js
│   ├── save.js
│   ├── utils.js
│   ├── animation.js
│   ├── event.js
│   └── tests.js
├── dist/
│   └── app.min.js (généré après build)
├── index.html
├── build.js
├── package.json
└── README.md
```

---

## 🛠️ Scripts npm

* `npm run build` → génère `dist/app.min.js` (bundle minifié + sourcemap).
* `npm run watch` → regénère automatiquement le bundle quand un fichier `js/*.js` est modifié.

---

## ✅ Workflow conseillé

* **Développement local** : travaillez avec les fichiers séparés (`js/*.js`).
* **Production / déploiement** : lancez `npm run build`, modifiez `index.html` pour utiliser `dist/app.min.js`.

Ainsi, vous pouvez facilement basculer entre un code lisible en dev et un site optimisé en prod.