# 🎠 CarouselFuzz-Pro

<p align="center">
  <b>Le studio de création de carrousels LinkedIn & Instagram nouvelle génération, propulsé par l'IA et conçu avec un design Soft UI épuré.</b>
</p>

---

## ✨ Points Forts & Fonctionnalités

### 🎨 Design System « Soft UI Clean » (Style Iconly)
- **Interface 100 % lumineuse** : Surfaces tactiles blanches porcelaine, ombres douces diffuses et biseaux subtils.
- **Micro-interactions soignées** : Orbes 3D lumineux, zones de drop pointillées et boutons tactiles bleu électrique.
- **Bascule Thème** : Mode *Blanc Soft UI* par défaut, avec possibilité de basculer en mode *Midnight Glass* en 1 clic.

### 🤖 Hub de Génération IA & Formats Viraux
- **Moteur d'Actus & Breaking News** : Collez un article ou du texte brut, l'IA synthétise automatiquement en carrousel structuré.
- **Presets Viraux aiCarousels** :
  - ⚖️ *À faire vs À éviter (Do & Don't)*
  - 🔴 *Actu Chaude & Breaking News*
  - ❌ *Erreurs de débutant*
  - 🪜 *Framework & Guide Pas à Pas*
  - 🎯 *Avis Tranché & Débat*
  - 📈 *Étude de Cas Chiffrée*

### 🏷️ Multi-Profils & Kits de Marque (Brand Kits)
- Créez et basculez instantanément entre plusieurs espaces de marque (ex: *Nümtema Studio*, *TechPulse*, etc.).
- **Personnalisation complète** : Nom de marque, handle social (`@handle`), site web, logo (URL ou upload local).
- **Règles d'affichage du logo** : Visible sur toutes les slides, uniquement au début et à la fin, ou masqué.

### 📐 Ratios Multi-Plateformes & Zones de Sécurité
- **Formats supportés** :
  - `4:5` Portrait (LinkedIn, Instagram)
  - `1:1` Carré classique (LinkedIn, Twitter/X)
  - `3:4` Haut Instagram (Nouvel affichage IG)
  - `9:16` Vertical Plein Écran (TikTok, Stories, Reels)
- **Safe Zones Overlay** : Visualisez en temps réel les zones masquées par les en-têtes et légendes des réseaux sociaux.

### 🔤 Typographie & Google Fonts
- Intégration directe de liens **Google Fonts**.
- Presets en 1 clic : *Plus Jakarta Sans*, *Outfit*, *Space Grotesk*, *Playfair Display*, *Syne*, *Cinzel*, *Montserrat*, *Cormorant*.
- Contrôle précis des tailles de titre (24–120px), du texte (12–40px), des marges intérieures (padding) et de l'alignement.

### 📦 Export Haute Définition
- Export instantané en archive **ZIP** contenant toutes les slides rendues en **PNG 1080p**.

---

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) (version 18+ recommandée)
- Une clé API Google Gemini (ou Ollama en local)

### Installation

1. **Cloner le projet :**
   ```bash
   git clone https://github.com/Creativityliberty/CarouselFuzz-Pro.git
   cd CarouselFuzz-Pro
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Configurer la clé API Gemini :**
   - Créez un fichier `.env` à la racine :
     ```env
     GEMINI_API_KEY=votre_cle_api_gemini_ici
     ```
   - *Note : Vous pouvez aussi renseigner votre clé directement dans l'application via le bouton Paramètres (icône engrenage).*

4. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```

5. Ouvrez votre navigateur sur **`http://localhost:3000`**.

---

## 🛠️ Stack Technique

- **Frontend** : React 19, TypeScript, Vite, Tailwind CSS, Lucide React
- **Export & Rendu** : `html-to-image`, `jszip`
- **Backend & Proxy IA** : Express, Node.js, `@google/genai`
- **Build & Bundle** : Vite, esbuild, TypeScript

---

## 📄 Licence

Ce projet est sous licence MIT.
