import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { vendedorGuard } from './guards/rol/vendedor-guard';
import { supervisorGuard } from './guards/rol/supervisor-guard';
import { cajeroGuard } from './guards/rol/cajero-guard';
import { adminGuard } from './guards/rol/admin-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivateChild: [authGuard], // 🔥 protege TODO lo de abajo
    children: [
      {
        path: 'admin',
        loadComponent: () => import('./home/admin/admin').then((m) => m.Admin),
        canActivate: [adminGuard],
      },
      {
        path: 'cajero',
        loadComponent: () => import('./home/cajero/cajero').then((m) => m.Cajero),
        canActivate: [cajeroGuard],
      },
      {
        path: 'supervisor',
        loadComponent: () => import('./home/supervisor/supervisor').then((m) => m.Supervisor),
        canActivate: [supervisorGuard],
      },
      {
        path: 'vendedor',
        loadComponent: () => import('./home/vendedor/vendedor').then((m) => m.Vendedor),
        canActivate: [vendedorGuard],
      },

      // RUTAS DE SECCION
      {
        path: 'arqueos',
        loadComponent: () => import('./seccion/arqueos/arqueos').then((m) => m.ArqueosComponent),
      },
      {
        path: 'caja',
        loadComponent: () => import('./seccion/caja/caja').then((m) => m.CajaComponent),
      },
      {
        path: 'categorias',
        loadComponent: () => import('./seccion/categorias/categorias').then((m) => m.CategoriasComponent),
      },
      {
        path: 'cierres',
        loadComponent: () => import('./seccion/cierres/cierres').then((m) => m.CierresComponent),
      },
      {
        path: 'clientes',
        loadComponent: () => import('./seccion/clientes/clientes').then((m) => m.ClientesComponent),
      },
      {
        path: 'inventario',
        loadComponent: () => import('./seccion/inventario/inventario').then((m) => m.InventarioComponent),
        children: [
          {
            path: 'kardex',
            loadComponent: () => import('./productos/kardex/kardex').then((m) => m.Kardex),
          }
        ]
      },
      {
        path: 'pedido',
        loadComponent: () => import('./seccion/pedido/pedido').then((m) => m.PedidoComponent),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./seccion/productos/productos').then((m) => m.ProductosComponent),
        children: [
          {
            path: '',
            redirectTo: 'consulta',
            pathMatch: 'full',
          },
          {
            path: 'consulta',
            loadComponent: () =>
              import('./productos/consulta-producto/consulta-producto').then(
                (m) => m.ConsultaProducto,
              ),
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import('./productos/nuevo-producto/nuevo-producto').then((m) => m.NuevoProducto),
          },
          {
            path: 'ingreso',
            loadComponent: () =>
              import('./productos/ingreso-producto/ingreso-producto').then(
                (m) => m.IngresoProducto,
              ),
          },
          {
            path: 'salida',
            loadComponent: () =>
              import('./productos/salida-producto/salida-producto').then((m) => m.SalidaProducto),
          },
        ],
      },
      {
        path: 'proveedores',
        loadComponent: () => import('./seccion/proveedores/proveedores').then((m) => m.ProveedoresComponent),
      },
      {
        path: 'ubicaciones',
        loadComponent: () => import('./seccion/ubicaciones/ubicaciones').then((m) => m.UbicacionesComponent),
      },
      {
        path: 'ventas',
        loadComponent: () => import('./seccion/ventas/ventas').then((m) => m.VentasComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./seccion/usuarios/usuarios').then((m) => m.UsuariosComponent),
        children: [
          {
            path: 'crear-perfil',
            loadComponent: () => import('./personas/crear-perfil/crear-perfil').then((m) => m.CrearPerfil),
          },
          {
            path: 'lista-perfil',
            loadComponent: () => import('./personas/lista-perfil/lista-perfil').then((m) => m.ListaPerfil),
          }
        ]
      },
    ],
  },
];
