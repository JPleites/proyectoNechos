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
            redirectTo: 'consulta-almacenes',
            pathMatch: 'full',
          },
          {
            path: 'consulta-almacenes',
            loadComponent: () =>
              import('./modulo/almacenes/consulta-almacen/consulta-almacen').then(
                (m) => m.ConsultaAlmacen,
              ),
          },
          {
            path: 'crear-almacen',
            loadComponent: () =>
              import('./modulo/almacenes/crear-almacen/crear-almacen').then((m) => m.CrearAlmacen),
          },
          {
            path: 'consulta-ubicaciones',
            loadComponent: () =>
              import('./modulo/ubicaciones/consulta-ubicaciones/consulta-ubicaciones').then(
                (m) => m.ConsultaUbicaciones,
              ),
          },
          {
            path: 'crear-ubicacion',
            loadComponent: () =>
              import('./modulo/ubicaciones/crear-ubicacion/crear-ubicacion').then(
                (m) => m.CrearUbicacion,
              ),
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
        path: 'descuentos',
        loadComponent: () =>
          import('./seccion/descuentos/descuentos').then((m) => m.DescuentosComponent),
        children: [
          {
            path: '',
            redirectTo: 'consulta',
            pathMatch: 'full',
          },
          {
            path: 'consulta',
            loadComponent: () =>
              import('./modulo/descuentos/consulta-descuentos/consulta-descuentos').then(
                (m) => m.ConsultaDescuentos,
              ),
          },
        ],
      },
      {
        path: 'devoluciones',
        loadComponent: () =>
          import('./seccion/devoluciones/devoluciones').then((m) => m.DevolucionesComponent),
        children: [
          {
            path: '',
            redirectTo: 'crear',
            pathMatch: 'full',
          },
          {
            path: 'crear',
            loadComponent: () =>
              import('./modulo/devoluciones/crear-devolucion/crear-devolucion').then(
                (m) => m.CrearDevolucion,
              ),
          },
        ],
      },
      {
        path: 'historicos',
        loadComponent: () =>
          import('./seccion/historicos/historicos').then((m) => m.HistoricosComponent),
        children: [
          {
            path: '',
            redirectTo: 'ventas',
            pathMatch: 'full',
          },
          {
            path: 'cierres',
            loadComponent: () =>
              import('./modulo/historicos/cierres/cierres').then((m) => m.Cierres),
          },
          {
            path: 'devoluciones',
            loadComponent: () =>
              import('./modulo/historicos/devoluciones/devoluciones').then((m) => m.Devoluciones),
          },
          {
            path: 'pedidos',
            loadComponent: () =>
              import('./modulo/historicos/pedidos/pedidos').then((m) => m.Pedidos),
          },
          {
            path: 'ventas',
            loadComponent: () => import('./modulo/historicos/ventas/ventas').then((m) => m.Ventas),
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
          {
            path: 'transferir',
            loadComponent: () =>
              import('./modulo/productos/transferir-productos/transferir-productos').then(
                (m) => m.TransferirProductos,
              ),
          },
          {
            path: 'editar/:id',
            loadComponent: () =>
              import('./modulo/productos/editar-producto/editar-producto').then(
                (m) => m.EditarProducto,
              ),
          },

          {
            path: 'kardex',
            loadComponent: () => import('./modulo/inventario/kardex/kardex').then((m) => m.Kardex),
          },
          {
            path: 'consulta-inventario',
            loadComponent: () =>
              import('./modulo/inventario/consulta-inventario/consulta-inventario').then(
                (m) => m.ConsultaInventario,
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
        path: 'descuentos',
        loadComponent: () =>
          import('./seccion/descuentos/descuentos').then((m) => m.DescuentosComponent),
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
