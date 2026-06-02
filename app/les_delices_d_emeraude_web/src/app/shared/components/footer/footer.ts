import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  imports: [FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
    email = '';
  currentYear = new Date().getFullYear();

  socialLinks = [
    { name: 'Facebook', url: '#', icon: 'f' },
    { name: 'Instagram', url: '#', icon: 'i' },
    { name: 'Twitter', url: '#', icon: 't' },
    { name: 'Pinterest', url: '#', icon: 'p' }
  ];

  subscribe(): void {
    if (this.email) {
      console.log('Subscribing:', this.email);
      this.email = '';
    }
  }
}
