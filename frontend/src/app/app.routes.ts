import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { vendedorGuard } from './guards/rol/vendedor-guard';
import { supervisorGuard } from './guards/rol/supervisor-guard';
import { cajeroGuard } from './guards/rol/cajero-guard';
import { adminGuard } from './guards/rol/admin-guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent)
    },
    {
        path: 'admin',
        loadComponent: () => import('./home/admin/admin').then(m => m.Admin),
        canActivate: [authGuard, adminGuard]
    },
    {
        path: 'cajero',
        loadComponent: () => import('./home/cajero/cajero').then(m => m.Cajero),
        canActivate: [authGuard, cajeroGuard]
    },
    {
        path: 'supervisor',
        loadComponent: () => import('./home/supervisor/supervisor').then(m => m.Supervisor),
        canActivate: [authGuard, supervisorGuard]
    },
    {
        path: 'vendedor',
        loadComponent: () => import('./home/vendedor/vendedor').then(m => m.Vendedor),
        canActivate: [authGuard, vendedorGuard]
    },
    {
        path: 'productos/consulta',
        loadComponent: () => import('./productos/consulta-producto/consulta-producto').then(m => m.ConsultaProducto)
    },
    {
        path: 'productos/nuevo',
        loadComponent: () => import('./productos/nuevo-producto/nuevo-producto').then(m => m.NuevoProducto)
    },
    {
        path: 'productos/ingreso',
        loadComponent: () => import('./productos/ingreso-producto/ingreso-producto').then(m => m.IngresoProducto)
    },
    {
        path: 'productos/salida',
        loadComponent: () => import('./productos/salida-producto/salida-producto').then(m => m.SalidaProducto)
    }
];
