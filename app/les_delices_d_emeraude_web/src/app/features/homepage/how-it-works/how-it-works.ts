import { Component } from '@angular/core';
import { HowItWorksStep } from '../../../shared/interfaces/how-it-works.types';

@Component({
  selector: 'app-how-it-works',
  imports: [],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.scss',
})
export class HowItWorks {
  readonly steps: HowItWorksStep[] = [
    {
      number: 1,
      title: 'Choisissez votre création',
      description: 'Parcourez le catalogue et sélectionnez votre pâtisserie. Personnalisez saveur, taille et décoration selon vos envies.',
      icon: 'M4 6h16M4 10h16M4 14h10 M3 5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5z',
    },
    {
      number: 2,
      title: 'Passez votre commande',
      description: 'Ajoutez au panier, renseignez vos informations et réglez en toute sécurité via Stripe. Confirmation immédiate par courriel.',
      icon: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
    },
    {
      number: 3,
      title: 'Récupérez et dégustez',
      description: 'Suivez l\'état de votre commande depuis votre espace client. Récupérez vos créations et savourez chaque bouchée.',
      icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
    },
  ];
}

