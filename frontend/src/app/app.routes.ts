import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import Consulta from './seccion/consulta/consulta';
import Navbar from './nav/navbar/navbar';
import { Nuevoproducto } from './seccion/nuevoproducto/nuevoproducto';
import { Ingreso } from './seccion/ingreso/ingreso';

export const routes: Routes = [
    {
        path: 'consulta',
        component: Consulta,
    },
    {
        path: 'navbar',
        component: Navbar,
    },
    {
        path: 'nuevoproducto',
        component: Nuevoproducto,
    },
    {
        path: 'ingreso',
        component: Ingreso,
    }

];
