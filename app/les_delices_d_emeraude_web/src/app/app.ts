import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./shared/components/header/header";
import { Footer } from "./shared/components/footer/footer";
import { ToastContainer } from "./features/productspage/toast-container/toast-container";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('les_delices_d_emeraude_web');
  public isNotAuthRoute(): boolean {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    return !(path.includes('/login') || path.includes('/register'));
  }
}
