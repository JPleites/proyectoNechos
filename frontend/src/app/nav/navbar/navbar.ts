import { Component } from '@angular/core';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-navbar',
  imports: [MdbCollapseModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export default class Navbar {}
