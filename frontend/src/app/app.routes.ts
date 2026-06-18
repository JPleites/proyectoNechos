import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth-guard';
import { vendedorGuard } from './auth/guards/rol/vendedor-guard';
import { supervisorGuard } from './auth/guards/rol/supervisor-guard';
import { cajeroGuard } from './auth/guards/rol/cajero-guard';
import { adminGuard } from './auth/guards/rol/admin-guard';

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
        path: 'almacenes',
        loadComponent: () =>
          import('./seccion/almacenes/almacenes').then((m) => m.AlmacenesComponent),
        children: [
          {
            path: '',
            redirectTo: 'consulta',
            pathMatch: 'full',
          },
          {
            path: 'consulta',
            loadComponent: () =>
              import('./modulo/almacenes/consulta-almacen/consulta-almacen').then(
                (m) => m.ConsultaAlmacen,
              ),
          },
          {
            path: 'crear',
            loadComponent: () =>
              import('./modulo/almacenes/crear-almacen/crear-almacen').then((m) => m.CrearAlmacen),
          },
        ],
      },
      {
        path: 'arqueos',
        loadComponent: () => import('./seccion/arqueos/arqueos').then((m) => m.ArqueosComponent),
      },
      {
        path: 'caja',
        loadComponent: () => import('./seccion/caja/caja').then((m) => m.CajaComponent),
        children: [
          {
            path: '',
            redirectTo: 'consulta-pedidos',
            pathMatch: 'full',
          },
          {
            path: 'consulta-pedidos',
            loadComponent: () =>
              import('./modulo/caja/caja/consulta-pedidos').then((m) => m.ConsultaPedidos),
          },
          // {
          //   path: 'cobro',
          //   loadComponent: () =>
          //     import('./modulo/caja/')
          // }
        ],
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./seccion/categorias/categorias').then((m) => m.CategoriasComponent),
        children: [
          {
            path: '',
            redirectTo: 'consulta',
            pathMatch: 'full',
          },
          {
            path: 'consulta',
            loadComponent: () =>
              import('./modulo/categorias/consulta-categoria/consulta-categoria').then(
                (m) => m.ConsultaCategoria,
              ),
          },
          {
            path: 'crear',
            loadComponent: () =>
              import('./modulo/categorias/crear-categoria/crear-categoria').then(
                (m) => m.CrearCategoria,
              ),
          },
          {
            path: 'crear-subcategoria',
            loadComponent: () =>
              import('./modulo/categorias/crear-subcategorias/crear-subcategorias').then(
                (m) => m.CrearSubcategorias,
              ),
          },
        ],
      },
      {
        path: 'cierres',
        loadComponent: () => import('./seccion/cierres/cierres').then((m) => m.CierresComponent),
        children: [
          {
            path: '',
            redirectTo: 'cierre-caja',
            pathMatch: 'full',
          },
          {
            path: 'cierre-caja',
            loadComponent: () =>
              import('./modulo/cierres/cierre-caja/cierre-caja').then((m) => m.CierreCaja),
          },
          {
            path: 'consulta-cierres',
            loadComponent: () =>
              import('./modulo/cierres/consulta-cierres/consulta-cierres').then(
                (m) => m.ConsultaCierres,
              ),
          },
        ],
      },
      {
        path: 'clientes',
        loadComponent: () => import('./seccion/clientes/clientes').then((m) => m.ClientesComponent),
        children: [
          {
            path: '',
            redirectTo: 'consulta',
            pathMatch: 'full',
          },
          {
            path: 'consulta',
            loadComponent: () =>
              import('./modulo/clientes/consulta-clientes/consulta-clientes').then(
                (m) => m.ConsultaClientes,
              ),
          },
          {
            path: 'crear',
            loadComponent: () =>
              import('./modulo/clientes/crear-cliente/crear-cliente').then((m) => m.CrearCliente),
          },
        ],
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./seccion/inventario/inventario').then((m) => m.InventarioComponent),
        children: [
          {
            path: '',
            redirectTo: 'kardex',
            pathMatch: 'full',
          },
          {
            path: 'kardex',
            loadComponent: () => import('./modulo/inventario/kardex/kardex').then((m) => m.Kardex),
          },
        ],
      },
      {
        path: 'pedido',
        loadComponent: () => import('./seccion/pedido/pedido').then((m) => m.PedidoComponent),
        children: [
          {
            path: '',
            redirectTo: 'nuevo-pedido',
            pathMatch: 'full',
          },
          {
            path: 'nuevo-pedido',
            loadComponent: () =>
              import('./modulo/pedido/nuevo-pedido/nuevo-pedido').then(
                (m) => m.NuevoPedidoComponent,
              ),
          },
          {
            path: 'consultar-pedidos',
            loadComponent: () =>
              import('./modulo/pedido/consulta-pedidos/consulta-pedidos').then(
                (m) => m.ConsultaPedidos,
              ),
          },
        ],
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./seccion/productos/productos').then((m) => m.ProductosComponent),
        children: [
          {
            path: '',
            redirectTo: 'gestionar',
            pathMatch: 'full',
          },
          {
            path: 'gestionar',
            loadComponent: () =>
              import('./modulo/productos/gestion-productos/gestion-productos').then(
                (m) => m.GestionProductos,
              ),
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import('./modulo/productos/nuevo-producto/nuevo-producto').then(
                (m) => m.NuevoProducto,
              ),
          },
          {
            path: 'ingreso',
            loadComponent: () =>
              import('./modulo/productos/ingreso-producto/ingreso-producto').then(
                (m) => m.IngresoProducto,
              ),
          },
          {
            path: 'salida',
            loadComponent: () =>
              import('./modulo/productos/salida-producto/salida-producto').then(
                (m) => m.SalidaProducto,
              ),
          },
        ],
      },
      {
        path: 'consulta-producto',
        loadComponent: () =>
          import('./seccion/consulta-producto/consulta-producto').then(
            (m) => m.ConsultaProductoComponent,
          ),
        children: [
          {
            path: '',
            redirectTo: 'consulta',
            pathMatch: 'full',
          },
          {
            path: 'consulta',
            loadComponent: () =>
              import('./modulo/productos/consulta-producto/consulta-producto').then(
                (m) => m.ConsultaProducto,
              ),
          },
        ],
      },
      {
        path: 'proveedores',
        loadComponent: () =>
          import('./seccion/proveedores/proveedores').then((m) => m.ProveedoresComponent),
        children: [
          {
            path: '',
            redirectTo: 'consulta',
            pathMatch: 'full',
          },
          {
            path: 'consulta',
            loadComponent: () =>
              import('./modulo/proveedores/consulta-proveedores/consulta-proveedores').then(
                (m) => m.ConsultaProveedores,
              ),
          },
          {
            path: 'crear',
            loadComponent: () =>
              import('./modulo/proveedores/crear-proveedor/crear-proveedor').then(
                (m) => m.CrearProveedor,
              ),
          },
          {
            path: 'crear-marca',
            loadComponent: () =>
              import('./modulo/marca/crear-marca/crear-marca').then((m) => m.CrearMarca),
          },
          {
            path: 'consulta-marcas',
            loadComponent: () =>
              import('./modulo/marca/consulta-marcas/consulta-marcas').then(
                (m) => m.ConsultaMarcas,
              ),
          },
        ],
      },
      {
        path: 'ubicaciones',
        loadComponent: () =>
          import('./seccion/ubicaciones/ubicaciones').then((m) => m.UbicacionesComponent),
        children: [
          {
            path: '',
            redirectTo: 'consulta',
            pathMatch: 'full',
          },
          {
            path: 'consulta',
            loadComponent: () =>
              import('./modulo/ubicaciones/consulta-ubicaciones/consulta-ubicaciones').then(
                (m) => m.ConsultaUbicaciones,
              ),
          },
          {
            path: 'crear',
            loadComponent: () =>
              import('./modulo/ubicaciones/crear-ubicacion/crear-ubicacion').then(
                (m) => m.CrearUbicacion,
              ),
          },
        ],
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
            path: '',
            redirectTo: 'crear-perfil',
            pathMatch: 'full',
          },
          {
            path: 'crear-perfil',
            loadComponent: () =>
              import('./modulo/personas/crear-perfil/crear-perfil').then((m) => m.CrearPerfil),
          },
          {
            path: 'lista-perfil',
            loadComponent: () =>
              import('./modulo/personas/lista-perfil/lista-perfil').then((m) => m.ListaPerfil),
          },
        ],
      },
    ],
  },
];
