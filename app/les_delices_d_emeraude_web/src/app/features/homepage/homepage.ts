import { Component } from '@angular/core';
import { Hero } from "./hero/hero";
import { FeaturedProducts } from "./featured-products/featured-products";
import { CategoriesSection } from "./categories-section/categories-section";
import { HowItWorks } from "./how-it-works/how-it-works";

@Component({
  selector: 'app-homepage',
  imports: [Hero, FeaturedProducts, CategoriesSection, HowItWorks],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss',
})
export class Homepage {}
