import { CarouselConfig, Slide, BrandProfile } from '../types';

export interface PrebuiltTemplate {
  id: string;
  title: string;
  subtitle: string;
  category: 'LinkedIn' | 'Instagram' | 'News' | 'Business';
  slideCount: number;
  previewGradient: string;
  config: Partial<CarouselConfig>;
}

export const PREBUILT_TEMPLATES: PrebuiltTemplate[] = [
  {
    id: 'template-iconly-soft',
    title: 'Iconly Soft UI Clean (Blanc Tactile & Bleu Royal)',
    subtitle: 'Design clair ultra-doux façon Apple/Iconly : ombres cotonneuses, dropzone pointillée, bulle lumineuse et boutons tactiles.',
    category: 'Instagram',
    slideCount: 6,
    previewGradient: 'from-blue-50 via-sky-50 to-white',
    config: {
      title: 'Design System Soft UI & Productivité',
      accentColor: '#1d4ed8',
      fontFamily: 'Plus Jakarta Sans',
      aspectRatio: '4:5',
      theme: 'light',
      slides: [
        {
          id: 'ic1',
          headline: 'L\'interface {Soft UI} qui convertit 3× plus',
          body: 'Pour un rendu haut de gamme, remplacez les contrastes agressifs par des surfaces tactiles en porcelaine et des ombres diffuses.',
          visualPrompt: 'soft white 3d minimal ui iconly style blue orb',
          layout: 'soft-ui-card',
          overlayOpacity: 0.1,
          headlineSize: 54,
          bodySize: 19,
          textAlign: 'left',
          contentPadding: 44,
          badgeText: 'ICONLY SET'
        },
        {
          id: 'ic2',
          headline: '1. La règle des {Ombres Diffuses}',
          body: 'N\'utilisez jamais d\'ombre noire pure. Préférez une ombre bleutée très large avec une faible opacité pour donner l\'effet de lévitation.',
          visualPrompt: 'floating white card soft shadow',
          layout: 'soft-ui-card',
          overlayOpacity: 0.1,
          headlineSize: 52,
          bodySize: 19,
          textAlign: 'left',
          contentPadding: 44,
          badgeText: 'ÉTAPE 01'
        },
        {
          id: 'ic3',
          headline: '2. Le biseau {Blanc Pur} supérieur',
          body: 'Ajoutez une bordure blanche d\'un pixel sur le contour de vos cartes grises claires pour capter la lumière virtuelle.',
          visualPrompt: 'clean minimal bevel border white',
          layout: 'soft-ui-card',
          overlayOpacity: 0.1,
          headlineSize: 52,
          bodySize: 19,
          textAlign: 'left',
          contentPadding: 44,
          badgeText: 'ÉTAPE 02'
        },
        {
          id: 'ic4',
          headline: '3. Un seul {Bleu Électrique} d\'action',
          body: 'Sur un fond 95% monochrome clair, votre bouton principal bleu électrique attire instantanément l\'œil de l\'utilisateur.',
          visualPrompt: 'electric blue pill button minimal',
          layout: 'soft-ui-card',
          overlayOpacity: 0.1,
          headlineSize: 52,
          bodySize: 19,
          textAlign: 'left',
          contentPadding: 44,
          badgeText: 'ÉTAPE 03'
        },
        {
          id: 'ic5',
          headline: '4. Des rayons de courbure {généreux}',
          body: 'Des coins arrondis entre 28px et 40px donnent immédiatement cette sensation organique, familière et rassurante.',
          visualPrompt: 'rounded corners ui geometry',
          layout: 'soft-ui-card',
          overlayOpacity: 0.1,
          headlineSize: 52,
          bodySize: 19,
          textAlign: 'left',
          contentPadding: 44,
          badgeText: 'ÉTAPE 04'
        },
        {
          id: 'ic6',
          headline: 'Sauvegardez ce {Design Kit}',
          body: 'Utilisez ce template Soft UI directement pour vos présentations SaaS, lancements produits et revues UX.',
          visualPrompt: 'clean finish card',
          layout: 'soft-ui-card',
          overlayOpacity: 0.1,
          headlineSize: 54,
          bodySize: 19,
          textAlign: 'left',
          contentPadding: 44,
          badgeText: 'SAUVEGARDER'
        }
      ]
    }
  },
  {
    id: 'template-news-flash',
    title: 'Actu Chaude & Breaking News',
    subtitle: 'Badge d\'alerte, citation clé et décryptage immédiat d\'une actualité.',
    category: 'News',
    slideCount: 6,
    previewGradient: 'from-amber-50 via-orange-50/40 to-white',
    config: {
      title: 'L\'Annonce Choc de la Semaine',
      accentColor: '#ea580c',
      fontFamily: 'Space Grotesk',
      aspectRatio: '4:5',
      theme: 'light',
      slides: [
        {
          id: 's1',
          headline: 'Le {Séisme} qui change la donne',
          body: 'Une mise à jour inattendue bouscule tout le marché cette semaine. Voici ce que tout le monde rate.',
          visualPrompt: 'breaking digital report dramatic lights',
          layout: 'news-flash',
          overlayOpacity: 0.85,
          headlineSize: 64,
          bodySize: 22,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: '🔴 FLASH ACTU'
        },
        {
          id: 's2',
          headline: 'Ce qui s\'est {réellement} passé',
          body: 'En moins de 48 heures, les règles ont été modifiées. Trois géants ont réagi en urgence.',
          visualPrompt: 'timeline data analytics minimalist',
          layout: 'card-glass',
          overlayOpacity: 0.85,
          headlineSize: 56,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: '01 · LES FAITS'
        },
        {
          id: 's3',
          headline: 'Pourquoi ça {impacte} votre activité',
          body: 'Ce n\'est pas qu\'une simple annonce de relations publiques : les répercussions directes commencent dès ce mois-ci.',
          visualPrompt: 'market shift technology abstract',
          layout: 'bold-title',
          overlayOpacity: 0.85,
          headlineSize: 58,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: '02 · L\'IMPACT'
        },
        {
          id: 's4',
          headline: 'L\'opportunité {secrète} à saisir',
          body: 'Pendant que la majorité hésite, les 5% les plus réactifs prennent une avance irrattrapable.',
          visualPrompt: 'gold neon opportunity glass cubes',
          layout: 'card-glass',
          overlayOpacity: 0.85,
          headlineSize: 56,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: '03 · L\'OPPORTUNITÉ'
        },
        {
          id: 's5',
          headline: 'Votre plan d\'action en {3 étapes}',
          body: '1. Auditer vos flux.\n2. Protéger vos marges.\n3. Adapter votre offre avant vendredi.',
          visualPrompt: 'minimalist checklist cyber interface',
          layout: 'card-glass',
          overlayOpacity: 0.85,
          headlineSize: 52,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: '04 · ACTION RAPIDE'
        },
        {
          id: 's6',
          headline: 'Partagez avec votre {équipe}',
          body: 'Enregistrez ce post pour l\'avoir sous la main lors de votre prochain point stratégique.',
          visualPrompt: 'modern sleek sign-off minimalist',
          layout: 'center',
          overlayOpacity: 0.85,
          headlineSize: 54,
          bodySize: 22,
          textAlign: 'center',
          contentPadding: 48,
          badgeText: '📌 ENREGISTREZ'
        }
      ]
    }
  },
  {
    id: 'template-do-dont',
    title: 'À faire vs À éviter (Do & Don\'t)',
    subtitle: 'Format viral LinkedIn à fort taux de sauvegarde et de partages.',
    category: 'LinkedIn',
    slideCount: 6,
    previewGradient: 'from-emerald-500/20 via-teal-600/10 to-slate-950',
    config: {
      title: '5 Pièges à Éviter Absolument',
      accentColor: '#10b981',
      fontFamily: 'Outfit',
      aspectRatio: '4:5',
      theme: 'midnight-glass',
      slides: [
        {
          id: 's1',
          headline: 'Arrêtez d\'écrire des emails que {personne} ne lit',
          body: '5 changements radicaux pour multiplier votre taux de réponse par 3 dès aujourd\'hui.',
          visualPrompt: 'minimalist inbox email typography dark',
          layout: 'bold-title',
          overlayOpacity: 0.85,
          headlineSize: 62,
          bodySize: 22,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'OUTREACH PRO'
        },
        {
          id: 's2',
          headline: 'La formule d\'intro qui {tue} vos conversions',
          body: 'La première impression se joue en 3 secondes. Arrêtez les formules creuses.',
          visualPrompt: 'split contrast minimalist',
          layout: 'comparison',
          overlayOpacity: 0.85,
          headlineSize: 48,
          bodySize: 18,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'SWAP 01',
          comparisonDont: '« J\'espère que vous allez bien en cette journée. »',
          comparisonDo: '« J\'ai vu votre dernier post sur l\'IA : voici une idée précise. »'
        },
        {
          id: 's3',
          headline: 'Parler de {vous} au lieu de leur problème',
          body: 'Votre prospect s\'en fiche de votre historique. Il veut savoir ce que vous résolvez.',
          visualPrompt: 'focus spotlight lens dark',
          layout: 'comparison',
          overlayOpacity: 0.85,
          headlineSize: 48,
          bodySize: 18,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'SWAP 02',
          comparisonDont: '« Notre société fondée en 2018 propose 12 services clés en main... »',
          comparisonDo: '« Nous supprimons 4h de saisie manuelle pour vos commerciaux chaque semaine. »'
        },
        {
          id: 's4',
          headline: 'L\'appel à l\'action qui fait {peur}',
          body: 'Personne ne veut bloquer 45 minutes avec un inconnu.',
          visualPrompt: 'calendar micro interaction sleek',
          layout: 'comparison',
          overlayOpacity: 0.85,
          headlineSize: 48,
          bodySize: 18,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'SWAP 03',
          comparisonDont: '« Avez-vous 45 min jeudi prochain pour une démo complète ? »',
          comparisonDo: '« Est-ce une priorité ce mois-ci, ou je vous recontacte plus tard ? »'
        },
        {
          id: 's5',
          headline: 'La règle d\'or des {top 1%}',
          body: 'Un bon email ressemble à un mot envoyé par un collègue d\'un bureau à l\'autre, jamais à une plaquette commerciale.',
          visualPrompt: 'glass card certificate luxury dark',
          layout: 'card-glass',
          overlayOpacity: 0.85,
          headlineSize: 52,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'LE PRINCIPE'
        },
        {
          id: 's6',
          headline: 'Enregistrez ce guide pour votre {équipe}',
          body: 'Cliquez sur l\'icône Enregistrer 🔖 pour l\'appliquer à votre prochaine campagne.',
          visualPrompt: 'minimal clean branding card',
          layout: 'center',
          overlayOpacity: 0.85,
          headlineSize: 54,
          bodySize: 22,
          textAlign: 'center',
          contentPadding: 48,
          badgeText: 'SAUVEGARDER'
        }
      ]
    }
  },
  {
    id: 'template-microblog',
    title: 'Microblog & Tweet Style',
    subtitle: 'Look social ultra moderne simulant des threads et citations à fort engagement.',
    category: 'Instagram',
    slideCount: 5,
    previewGradient: 'from-indigo-500/20 via-sky-600/10 to-slate-950',
    config: {
      title: 'Avis Tranché sur le Travail',
      accentColor: '#38bdf8',
      fontFamily: 'Inter',
      aspectRatio: '4:5',
      theme: 'midnight-glass',
      slides: [
        {
          id: 's1',
          headline: 'Travailler {12h par jour} n\'est pas un badge d\'honneur',
          body: 'C\'est souvent le signe d\'une absence totale de priorisation. Voici la vérité que personne n\'ose dire.',
          visualPrompt: 'dark minimal luxury aesthetic desk',
          layout: 'tweet-mockup',
          overlayOpacity: 0.85,
          headlineSize: 52,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'AVIS TRANCHÉ 🧵'
        },
        {
          id: 's2',
          headline: 'La fausse productivité du {bruit}',
          body: 'Remplir son agenda de réunions et répondre en 30 secondes sur Slack donne l\'illusion d\'avancer. En réalité, votre valeur ajoutée est nulle.',
          visualPrompt: 'clock hour glass minimal digital',
          layout: 'tweet-mockup',
          overlayOpacity: 0.85,
          headlineSize: 48,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: '01 / 04'
        },
        {
          id: 's3',
          headline: 'Les résultats viennent de {l\'intensité}',
          body: 'Quatre heures de deep work ininterrompu surpassent systématiquement dix heures de travail fragmenté.',
          visualPrompt: 'laser focus beam neon indigo',
          layout: 'tweet-mockup',
          overlayOpacity: 0.85,
          headlineSize: 48,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: '02 / 04'
        },
        {
          id: 's4',
          headline: 'Sachez dire {non} sans vous justifier',
          body: 'Chaque "oui" paresseux que vous donnez est un "non" violent à vos vrais objectifs majeurs.',
          visualPrompt: 'minimal door geometric dark',
          layout: 'tweet-mockup',
          overlayOpacity: 0.85,
          headlineSize: 48,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: '03 / 04'
        },
        {
          id: 's5',
          headline: 'Et vous, quel est votre {avis} ?',
          body: 'Dites-moi en commentaire si vous privilégiez le volume ou l\'intensité. Débattons-en.',
          visualPrompt: 'minimal discussion glow aesthetic',
          layout: 'center',
          overlayOpacity: 0.85,
          headlineSize: 54,
          bodySize: 22,
          textAlign: 'center',
          contentPadding: 48,
          badgeText: 'DÉBAT 👇'
        }
      ]
    }
  },
  {
    id: 'template-step-by-step',
    title: 'Framework & Pas à Pas',
    subtitle: 'Méthode numérotée, idéale pour enseigner un concept complexe avec simplicité.',
    category: 'Business',
    slideCount: 6,
    previewGradient: 'from-violet-500/20 via-purple-600/10 to-slate-950',
    config: {
      title: 'La Méthode en 4 Étapes',
      accentColor: '#a855f7',
      fontFamily: 'Outfit',
      aspectRatio: '4:5',
      theme: 'midnight-glass',
      slides: [
        {
          id: 's1',
          headline: 'Comment planifier toute votre semaine en {20 minutes}',
          body: 'Chaque dimanche soir. Un protocole rigoureux en 4 étapes pour attaquer le lundi l\'esprit totalement libre.',
          visualPrompt: 'futuristic calendar dashboard sleek dark',
          layout: 'bold-title',
          overlayOpacity: 0.85,
          headlineSize: 58,
          bodySize: 22,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'MÉTHODE SIMPLE'
        },
        {
          id: 's2',
          headline: 'Videz entièrement votre {cerveau}',
          body: 'Notez chaque tâche, micro-détail ou anxiété sur une liste brute sans filtrer. Libérez votre RAM mentale.',
          visualPrompt: 'brain synapse digital light glass',
          layout: 'card-glass',
          overlayOpacity: 0.85,
          headlineSize: 50,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'ÉTAPE 1 / 4'
        },
        {
          id: 's3',
          headline: 'Choisissez vos {3 victoires} majeures',
          body: 'Si la semaine devait s\'arrêter mercredi, quelles sont les 3 seules réalisations qui rendraient la semaine victorieuse ?',
          visualPrompt: 'trophy podium glass gold minimalist',
          layout: 'card-glass',
          overlayOpacity: 0.85,
          headlineSize: 50,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'ÉTAPE 2 / 4'
        },
        {
          id: 's4',
          headline: 'Time-bloquez avant de {subir}',
          body: 'Bloquez vos sessions de concentration dans votre calendrier avant que les autres ne viennent coloniser vos créneaux.',
          visualPrompt: 'locked block glowing purple crystal',
          layout: 'card-glass',
          overlayOpacity: 0.85,
          headlineSize: 50,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'ÉTAPE 3 / 4'
        },
        {
          id: 's5',
          headline: 'Prévoyez 30% de {marge tampon}',
          body: 'Les urgences arriveront toujours. Une semaine planifiée à 100% est une semaine garantie d\'échouer.',
          visualPrompt: 'shield glowing cyber glass',
          layout: 'card-glass',
          overlayOpacity: 0.85,
          headlineSize: 50,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'ÉTAPE 4 / 4'
        },
        {
          id: 's6',
          headline: 'Testez-le dès ce {dimanche}',
          body: 'Enregistrez ce carrousel pour l\'appliquer ce week-end. Votre productivité vous remerciera.',
          visualPrompt: 'sleek finish badge',
          layout: 'center',
          overlayOpacity: 0.85,
          headlineSize: 54,
          bodySize: 22,
          textAlign: 'center',
          contentPadding: 48,
          badgeText: 'ACTION'
        }
      ]
    }
  },
  {
    id: 'template-quiz-answers',
    title: 'Quiz & Réponses Cachées (Guess the Answer)',
    subtitle: 'Format ultra viral avec questions choc et réponses numérotées sur le slide suivant.',
    category: 'LinkedIn',
    slideCount: 7,
    previewGradient: 'from-yellow-500/20 via-amber-600/10 to-slate-950',
    config: {
      title: 'Quiz : 1 personne sur 10 trouve tout juste',
      accentColor: '#eab308',
      fontFamily: 'Space Grotesk',
      aspectRatio: '3:4',
      theme: 'midnight-glass',
      slides: [
        {
          id: 'q1',
          headline: 'Seul {1 sur 10} a 4/4 à ce test',
          body: '4 questions pièges de culture générale et business. Réponses à la fin sans tricher !',
          visualPrompt: 'mysterious quiz question neon yellow',
          layout: 'bold-title',
          overlayOpacity: 0.85,
          headlineSize: 62,
          bodySize: 22,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'QUIZ TIME 🧠'
        },
        {
          id: 'q2',
          headline: 'Quelle planète a le plus de {lunes} ?',
          body: 'A) Jupiter\nB) Saturne\nC) Neptune',
          visualPrompt: 'planets space astronomy minimalist',
          layout: 'card-glass',
          overlayOpacity: 0.85,
          headlineSize: 52,
          bodySize: 22,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'QUESTION 1 / 4'
        },
        {
          id: 'q3',
          headline: 'Combien d\'os a un {requin} ?',
          body: 'A) 0 (que du cartilage)\nB) 120\nC) 206',
          visualPrompt: 'shark ocean deep water dark',
          layout: 'card-glass',
          overlayOpacity: 0.85,
          headlineSize: 52,
          bodySize: 22,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'QUESTION 2 / 4'
        },
        {
          id: 'q4',
          headline: 'Quel aliment ne {périme jamais} ?',
          body: 'A) Le riz\nB) Le miel\nC) Le sel',
          visualPrompt: 'honey pot gold amber aesthetic',
          layout: 'card-glass',
          overlayOpacity: 0.85,
          headlineSize: 52,
          bodySize: 22,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'QUESTION 3 / 4'
        },
        {
          id: 'q5',
          headline: 'Quel pourcentage de l\'océan a été {cartographié} ?',
          body: 'A) 20%\nB) 55%\nC) 80%',
          visualPrompt: 'abyssal ocean trench underwater depth',
          layout: 'card-glass',
          overlayOpacity: 0.85,
          headlineSize: 50,
          bodySize: 22,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'QUESTION 4 / 4'
        },
        {
          id: 'q6',
          headline: 'LES {RÉPONSES} SONT ICI',
          body: '1. Saturne (146 lunes)\n2. 0 (zéro os, tout en cartilage)\n3. Le miel (impérissable)\n4. Seulement 20% !',
          visualPrompt: 'answers checklist neon trophy',
          layout: 'card-glass',
          overlayOpacity: 0.85,
          headlineSize: 56,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: '// RÉSULTATS'
        },
        {
          id: 'q7',
          headline: 'Quel est votre {score} ?',
          body: 'Mettez votre note sur 4 en commentaire ! Le premier qui a 4/4 gagne toute mon estime.',
          visualPrompt: 'chat message balloon yellow lime',
          layout: 'center',
          overlayOpacity: 0.85,
          headlineSize: 58,
          bodySize: 24,
          textAlign: 'center',
          contentPadding: 48,
          badgeText: 'COMMENTEZ 👇'
        }
      ]
    }
  },
  {
    id: 'template-founder-story',
    title: 'Storytelling & Échec fondateur (Founder Story)',
    subtitle: 'Récit personnel captivant : du fond du gouffre jusqu\'au déclic salvateur.',
    category: 'Business',
    slideCount: 6,
    previewGradient: 'from-rose-500/20 via-red-600/10 to-slate-950',
    config: {
      title: 'Au mois 9, nous n\'avions plus que 4 000€ en banque',
      accentColor: '#f43f5e',
      fontFamily: 'Plus Jakarta Sans',
      aspectRatio: '4:5',
      theme: 'midnight-glass',
      slides: [
        {
          id: 'fs1',
          headline: 'Nous avons failli {fermer} au mois 9',
          body: 'Aujourd\'hui nous avons 1 000 clients payants. Voici le virage à 180° qui a tout sauvé.',
          visualPrompt: 'dramatic founder startup story dark minimal',
          layout: 'bold-title',
          overlayOpacity: 0.85,
          headlineSize: 60,
          bodySize: 22,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'HISTOIRE VRAIE'
        },
        {
          id: 'fs2',
          headline: 'Mois 1 : {Zéro client}, que des hypothèses',
          body: 'Nous avons codé pendant 6 mois enfermés dans une pièce sans parler à un seul vrai acheteur. La pire erreur.',
          visualPrompt: 'two empty chairs startup desk dark',
          layout: 'card-glass',
          overlayOpacity: 0.85,
          headlineSize: 52,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'MOIS 01'
        },
        {
          id: 'fs3',
          headline: 'Mois 9 : Plus que {4 000 €} sur le compte',
          body: 'La panique totale. Plus aucun salaire possible. C\'est là qu\'on a arrêté de dev et qu\'on a pris le téléphone.',
          visualPrompt: 'red warning signal clock running out',
          layout: 'card-glass',
          overlayOpacity: 0.85,
          headlineSize: 52,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'LE CHOC'
        },
        {
          id: 'fs4',
          headline: 'Le coup de fil qui a {tout changé}',
          body: '« Votre logiciel fait 50 trucs inutiles, mais si vous automatisez ce seul fichier Excel, je paye 500€/mois tout de suite. »',
          visualPrompt: 'single bright spotlight discovery',
          layout: 'tweet-mockup',
          overlayOpacity: 0.85,
          headlineSize: 48,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'LE DÉCLIC'
        },
        {
          id: 'fs5',
          headline: 'La leçon qui vaut {1 million}',
          body: 'Supprimez 80% de vos fonctionnalités. Devenez irremplaçable sur une seule douleur aiguë.',
          visualPrompt: 'sculpture carved marble minimal',
          layout: 'card-glass',
          overlayOpacity: 0.85,
          headlineSize: 54,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'LA LEÇON'
        },
        {
          id: 'fs6',
          headline: 'Ne faites pas la même {erreur}',
          body: 'Partagez ce carrousel à un ami entrepreneur qui code en silence sans vendre.',
          visualPrompt: 'handshake partnership modern sleek',
          layout: 'center',
          overlayOpacity: 0.85,
          headlineSize: 54,
          bodySize: 22,
          textAlign: 'center',
          contentPadding: 48,
          badgeText: 'PARTAGEZ 🔁'
        }
      ]
    }
  },
  {
    id: 'template-openbot-gold',
    title: 'OpenBot Luxury Gold (Visuel Haut + Pillule Glass)',
    subtitle: 'La réplique exacte du template PDF : bandeau numéroté, boîte visuelle dorée, pillule titre et typographie aérée.',
    category: 'LinkedIn',
    slideCount: 8,
    previewGradient: 'from-amber-600/30 via-yellow-700/20 to-black',
    config: {
      title: 'Débloquez le Plein Potentiel d\'OpenBot',
      accentColor: '#fbbf24',
      fontFamily: 'Outfit',
      aspectRatio: '4:5',
      theme: 'midnight-glass',
      slides: [
        {
          id: 'ob1',
          headline: 'Débloquez le Plein {Potentiel} d\'OpenBot',
          body: 'Découvrez comment les agents IA d\'OpenBot transforment vos demandes en solutions livrées.\n\nUn mini guide pour faire exécuter, pas seulement répondre...',
          visualPrompt: 'black gold luxury cyber robot glowing 3d minimal',
          layout: 'bold-title',
          overlayOpacity: 0.85,
          headlineSize: 64,
          bodySize: 20,
          textAlign: 'left',
          contentPadding: 48,
          badgeText: 'MINI GUIDE'
        },
        {
          id: 'ob2',
          headline: 'Votre Clé pour des {Jobs Sur-Mesure}',
          body: 'OpenBot agit comme un relais précis : il adapte les capacités vastes de l\'IA à votre contexte unique.\n\nImaginez une équipe d\'agents qui exécute vos demandes avec la spécificité d\'un expert dans votre domaine.\n\nC\'est la clé pour transformer votre ordinateur en un assistant personnel sur mesure.',
          visualPrompt: 'golden energy wave lines abstract dark',
          layout: 'gold-top-visual',
          overlayOpacity: 0.85,
          headlineSize: 38,
          bodySize: 17,
          textAlign: 'left',
          contentPadding: 40,
          badgeText: 'OPENBOT'
        },
        {
          id: 'ob3',
          headline: 'Avant OpenBot : Une {Mer d\'Incertitude}',
          body: 'Sans OpenBot, l\'interaction avec l\'IA ressemble souvent à naviguer dans un océan d\'incertitudes. Les réponses génériques ou hors sujet ne sont pas rares, laissant l\'utilisateur avec des idées, jamais des livrables.\n\nOpenBot arrive comme une bouée de sauvetage : il oriente l\'IA vers des actions concrètes exécutées sur votre machine.',
          visualPrompt: 'laptop glowing cute golden robot on screen desk dark',
          layout: 'gold-top-visual',
          overlayOpacity: 0.85,
          headlineSize: 38,
          bodySize: 17,
          textAlign: 'left',
          contentPadding: 40,
          badgeText: 'AVANT'
        },
        {
          id: 'ob4',
          headline: 'La Révolution des {Résultats}',
          body: 'OpenBot révolutionne la manière dont nous interagissons avec l\'IA : chaque agent sert de guide pour canaliser sa puissance vers des résultats hautement personnalisés.\n\nEn décrivant clairement votre objectif, vous transformez chaque demande en un flux d\'exécution prêt à l\'emploi.',
          visualPrompt: 'flowing gold liquid lines technology luxury',
          layout: 'gold-top-visual',
          overlayOpacity: 0.85,
          headlineSize: 38,
          bodySize: 17,
          textAlign: 'left',
          contentPadding: 40,
          badgeText: 'RÉSULTATS'
        },
        {
          id: 'ob5',
          headline: 'Formuler pour Réussir : {Vos Demandes}',
          body: 'Un bon job commence par une demande claire : le but, le contexte, le résultat attendu.\n\nDécrivez la fin plutôt que les moyens — vos agents OpenBot se chargent du chemin. Moins de va-et-vient, des livrables prêts dès la première tentative.',
          visualPrompt: 'sleek computer terminal with golden glowing agent',
          layout: 'gold-top-visual',
          overlayOpacity: 0.85,
          headlineSize: 38,
          bodySize: 17,
          textAlign: 'left',
          contentPadding: 40,
          badgeText: 'PROMPT PRO'
        },
        {
          id: 'ob6',
          headline: 'La Magie en Action : {Avant / Après}',
          body: '« Prépare mon lancement de la semaine : surveille les mentions, rédige le carrousel noir et or, prépare les visuels, programme la publication. »\n\nVos agents exécutent le tout, étape par étape, et livrent le résultat directement dans votre chat.',
          visualPrompt: 'golden waves glowing luxury dark background',
          layout: 'gold-top-visual',
          overlayOpacity: 0.85,
          headlineSize: 38,
          bodySize: 17,
          textAlign: 'left',
          contentPadding: 40,
          badgeText: 'EXEMPLE 01'
        },
        {
          id: 'ob7',
          headline: 'Automatisation & {Action Directe}',
          body: '« Nettoie mon disque dur » : OpenBot identifie les doublons, archivise les fichiers datés, sécurise les documents importants et vous propose un rapport avant d\'agir.\n\nVous validez une fois, l\'agent s\'occupe du reste.',
          visualPrompt: 'laptop screen golden robot agent smiling dark room',
          layout: 'gold-top-visual',
          overlayOpacity: 0.85,
          headlineSize: 38,
          bodySize: 17,
          textAlign: 'left',
          contentPadding: 40,
          badgeText: 'EXEMPLE 02'
        },
        {
          id: 'ob8',
          headline: 'Prêt à passer à {l\'action} ?',
          body: '« Réglé en 3 minutes. Mon carrousel était prêt avant mon café. » — Karim T.\n« Je gère mes trois boutiques sans toucher à Chrome. » — Alex R.\n\nRejoignez le mouvement dès aujourd\'hui.',
          visualPrompt: 'minimal testimonial cards gold luxury',
          layout: 'center',
          overlayOpacity: 0.85,
          headlineSize: 56,
          bodySize: 20,
          textAlign: 'center',
          contentPadding: 48,
          badgeText: 'FEEDBACKS'
        }
      ]
    }
  }
];

export const DEFAULT_BRAND_PROFILES: BrandProfile[] = [
  {
    id: 'profile-numtema',
    name: 'Nümtema Studio',
    accentColor: '#1d4ed8',
    fontFamily: 'Plus Jakarta Sans',
    branding: {
      companyName: 'Numtema',
      companyWebsite: 'numtemaagency.com',
      handle: '@numtema',
      authorRole: 'Creative Direction',
      iconUri: 'https://www.numtemaagency.com/images/logo-perle-lion.webp',
      showBranding: true,
      displayMode: 'all'
    }
  },
  {
    id: 'profile-tech-news',
    name: 'TechPulse Daily',
    accentColor: '#f59e0b',
    fontFamily: 'Space Grotesk',
    branding: {
      companyName: 'TechPulse Media',
      companyWebsite: 'techpulse.io',
      handle: '@techpulse',
      authorRole: 'Tech & AI News',
      showBranding: true,
      displayMode: 'all'
    }
  },
  {
    id: 'profile-growth',
    name: 'B2B Growth Lab',
    accentColor: '#818cf8',
    fontFamily: 'Plus Jakarta Sans',
    branding: {
      companyName: 'Growth Lab',
      companyWebsite: 'growthlab.co',
      handle: '@growthlab',
      authorRole: 'B2B Strategy',
      showBranding: true,
      displayMode: 'first-last'
    }
  }
];
