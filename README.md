# 🧬 Gynéco-Quest

Un **jeu de révision** pour mémoriser par cœur les ~180 questions de gynéco-obstétrique
(jurys **Zamane, Kiemtoré, Millogo** + questions cliniques + Gynéco-hyper).

Conçu pour un cerveau qui a du mal à se concentrer : sessions courtes, récompenses immédiates
(XP, niveaux, séries 🔥, confettis, sons), et un moteur de mémoire qui te ressort
**exactement ce que tu oublies**.

---

## 🚀 Comment jouer tout de suite (sans rien installer)

Double-clique sur `index.html` → ça s'ouvre dans ton navigateur. C'est tout.
Ta progression est sauvegardée automatiquement sur l'appareil.

> Sur certains navigateurs, le mode hors-ligne (PWA) et le service worker ne marchent
> qu'en passant par un vrai serveur (voir « Mettre en ligne » plus bas) — mais le jeu
> lui-même fonctionne déjà en double-cliquant le fichier.

---

## 🎮 Les modes

| Mode | À quoi ça sert |
|------|----------------|
| 🃏 **Révision intelligente** | Le cœur. **Répétition espacée** (système de Leitner) : les cartes que tu rates reviennent vite, celles que tu maîtrises s'espacent. C'est *la* méthode qui grave en mémoire. |
| ⚡ **Quiz éclair** | QCM rapide (12 questions). Les mauvaises réponses proposées viennent du **même chapitre** → ça t'apprend à ne pas confondre. |
| ⏱️ **Blitz 60 s** | Combien de bonnes réponses en 1 minute ? Pur shoot de dopamine, parfait pour réviser dans le bus. |
| 🗂️ **Par chapitre** | Affronte un thème à la fois. Atteins **100 %** → tu bats le **boss 👑** du chapitre. |

Bonus : **Plan d'attaque sur 3 jours** 🗺️ et **Trophées** 🏅 à débloquer.

---

## 🧠 La science derrière le jeu (pourquoi ça marche)

Tu n'as pas un problème de mémoire — tu as besoin de la **bonne méthode**. Le jeu applique
les 4 techniques d'apprentissage les plus prouvées :

1. **Rappel actif (testing effect)** — se *tester* grave 2× mieux que relire. Chaque carte
   te force à chercher la réponse *avant* de la voir.
2. **Répétition espacée** — revoir une info juste avant de l'oublier. Le moteur de Leitner
   programme automatiquement les révisions (boîtes 1→5).
3. **Entrelacement (interleaving)** — mélanger les chapitres au lieu de bachoter un seul
   bloc. Le mode Révision le fait pour toi.
4. **Mnémotechniques** — acronymes et images mentales pour les listes (voir ci-dessous).

À cela s'ajoute la **gratification immédiate** (XP, niveaux, séries, confettis, sons) : le
cerveau retient bien mieux ce qui est **récompensé sur le moment**. C'est le ressort qui rend
la révision « accro » au lieu de pénible.

### 📚 Chaque carte a 3 couches d'apprentissage
1. **La réponse du cours** (texte du document, inchangée) — ce que tu dois réciter à l'examen.
2. **💡 Pour retenir** — une astuce mémoire (image, acronyme, ancrage de chiffres) sur **les 183 cartes**.
3. **🧠 Comprendre en simple (+)** — un bouton qui déplie une **explication longue et simplifiée**
   (« En clair ») pour vraiment *comprendre* le mécanisme, pas juste réciter. Présent sur **les 183 cartes**.

Idée : tu lis la réponse du cours, tu retiens grâce à l'astuce, et si ça ne « clique » pas,
tu ouvres le **+** pour comprendre en profondeur. Comprendre = retenir sans forcer.

### ⏱️ Comment réviser concrètement
- Des **sessions de 10 minutes**, plusieurs fois par jour, valent mieux qu'une longue séance.
- Garde ta **flamme 🔥 quotidienne** (objectif : 30 cartes/jour).
- Le matin : nouvelles cartes. Le soir : Révision intelligente (consolidation pendant le sommeil).

---

## 🔑 Les mnémotechniques à connaître par cœur

| Sujet | Astuce |
|-------|--------|
| Caractères des contractions utérines | **IRI PTDR** : Involontaires, Rythmées, Intermittentes, Progressives, Totales, Douloureuses, Régulières |
| HELLP syndrome | **H-EL-LP** : Hémolyse, Elevated Liver enzymes, Low Platelets |
| Signes du HRP | **Utérus de BOIS** (hypertonie) |
| Pré-rupture utérine | Signe de **BANDL-FROMMEL** = utérus en sablier |
| Engagement | Diagnostic = signe de **FARABEUF** |
| Douleur épigastrique en barre (prééclampsie) | Signe de **CHAUSSIER** |
| Traitement crise drépanocytaire | **HAATOP** : Hydratation, Analgésie, Anti-inflammatoire, Transfusion, Oxygène, Psychothérapie |
| Étiologies du placenta prævia | **SAGA-FM** : Synéchies, Antécédent d'endométrite, Grossesses multiples, Ablation de myome, Fibrome, Malformation |
| Causes d'hémorragie de la délivrance | **4 T** : Tonus, Tissu, Trauma, Thrombine |
| Sulfate de Mg — surveillance | **FR ≥ 16 / ROT présents / Diurèse ≥ 30 ml/h** |
| Contraception d'urgence | **Pilule 3 j / Ella 5 j / DIU 5 j** |

---

## 🗺️ Ordre d'apprentissage recommandé

1. **Fondations** : 📖 Définitions + 🤰 Accouchement & mécanique
2. **Urgences (haut rendement à l'examen)** : 🩸 Hémorragies + ⚡ Prééclampsie + 🍼 Post-partum
3. **Le reste** : présentations, avortement, césarienne, infections, contraception, cancers,
   gynéco médicale, santé publique, terrains particuliers.

Le détail jour par jour est dans l'onglet **🗺️ Plan d'attaque** du jeu.

---

## 🌍 Mettre en ligne sur GitHub Pages (pour jouer partout, sur ton téléphone)

1. Crée un compte sur **github.com** (gratuit).
2. Crée un nouveau dépôt (**New repository**), nomme-le par ex. `gyneco-quest`, coche *Public*.
3. Téléverse tous les fichiers de ce dossier (`index.html`, `style.css`, `app.js`,
   `data.js`, `manifest.json`, `sw.js`, `icon.svg`) :
   bouton **Add file → Upload files** → glisse-dépose → **Commit changes**.
4. Va dans **Settings → Pages**.
5. Sous *Build and deployment* → *Source* : choisis **Deploy from a branch**,
   branche **main**, dossier **/ (root)** → **Save**.
6. Attends ~1 minute. Ton jeu sera à l'adresse :
   `https://TON-PSEUDO.github.io/gyneco-quest/`
7. Ouvre ce lien sur ton téléphone → menu du navigateur → **« Ajouter à l'écran d'accueil »**.
   Le jeu s'installe comme une appli et **fonctionne hors-ligne** 📲.

> Astuce ligne de commande (si tu connais git) :
> ```bash
> git init && git add . && git commit -m "Gynéco-Quest"
> git branch -M main
> git remote add origin https://github.com/TON-PSEUDO/gyneco-quest.git
> git push -u origin main
> ```

---

## ✏️ Modifier / ajouter des questions

Tout est dans **`data.js`**. Chaque carte :

```js
{ id:"u1", cat:"urg", diff:2,
  q:"Définir le HRP",
  a:"Hématome rétro-placentaire (DPPNI)...",
  mnemo:"Utérus de BOIS" }   // mnemo est optionnel
```

- `cat` = identifiant d'un chapitre (voir le tableau `categories` en haut du fichier).
- `diff` = 1 (facile) à 3 (dur), purement indicatif.
- Ajoute autant de cartes que tu veux : elles apparaissent automatiquement.

---

## ⚠️ Note importante

Le contenu provient **de tes propres documents de cours** (protocoles du service + réponses
aux questions). Il sert à **réviser pour ton examen**, pas de référence médicale officielle.
En cas de doute sur une dose ou une CAT, vérifie toujours dans le protocole de service à jour.

Bon courage pour ce week-end — tu vas les avoir, ces questions. 💪🔥
