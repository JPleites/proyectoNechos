import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ProductosService } from '../../services/productos.service';
import { PedidosService } from '../../services/pedidos.service';
import { ClientesService } from '../../services/clientes.service';
import { AlmacenesService } from '../../services/almacenes.service';

@Component({
  selector: 'app-nuevo-pedido',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nuevo-pedido.html',
})
export class NuevoPedidoComponent implements OnInit {
  form: FormGroup;

  productos: any[] = [];
  clientes: any[] = [];
  carrito: any[] = [];
  almacenes: any[] = [];
  ubicaciones: any[] = [];
  busquedaCliente: string = '';
  productoEncontrado: boolean = false;

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private pedidosService: PedidosService,
    private clientesService: ClientesService,
    private almacenesService: AlmacenesService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      clienteId: [''],
      almacenId: [''],
      codigoBarra: [''],
      productoCodigo: [''],
      ubicacion: [''],
      cantidad: [1],
    });
  }

  ngOnInit() {
    this.cargarProductos();
    this.cargarClientes();
    this.cargarAlmacenes();
  }

  cargarProductos() {
    this.productosService.getProductos().subscribe({
      next: (data: any) => (this.productos = data),
    });
    this.cdr.detectChanges();
  }

  cargarClientes() {
    this.clientesService.getClientes().subscribe({
      next: (data: any) => (this.clientes = data),
    });
    this.cdr.detectChanges();
  }

  get clientesFiltrados() {
    if (!this.busquedaCliente) return this.clientes;
    const q = this.busquedaCliente.toLowerCase();
    return this.clientes.filter(
      (c) => c.nombre.toLowerCase().includes(q) || String(c.id).includes(q),
      this.cdr.detectChanges(),
    );
  }

  buscarProductoPorCodigo() {
    this.ubicaciones = [];
    this.productoEncontrado = false;
    const codigo = this.form.value.codigoBarra;

    const producto = this.productos.find((p) => String(p.codigo).trim() === String(codigo).trim());

    if (!producto) {
      Swal.fire('No encontrado', 'Producto no existe', 'warning');
      return;
    } else {
      this.productoEncontrado = true;

      this.form.patchValue({
        productoCodigo: producto.codigo,
      });

      this.cargarUbicaciones(
        producto.codigo,
        this.form.value.almacenId,
        Number(this.form.value.cantidad),
      );
    }
  }

  cargarAlmacenes() {
    this.almacenesService.getAlmacenes().subscribe({
      next: (data: any) => {
        this.almacenes = [...data];
      },
    });
  }

  cargarUbicaciones(productoCodigo: string, almacenId: string, cantidad: number) {
    if (!almacenId) {
      Swal.fire('Error', 'Selecciona un almacén primero', 'warning');
      return;
    }

    console.log('Producto:', productoCodigo, 'Almacén:', almacenId, 'Cantidad:', cantidad);

    this.productosService
      .getUbicaciones(productoCodigo, almacenId, cantidad)
      .subscribe((data: any) => {
        if (data && data.length > 0) {

          this.ubicaciones = data;

          console.log('Ubicaciones obtenidas:', data);
          this.cdr.detectChanges();
        } else {
          Swal.fire(
            'Error',
            'No hay ubicaciones disponibles o con suficiente stock para este producto en el almacén seleccionado',
            'error',
          );
          this.productoEncontrado = false;
        }
      });
  }

  // ➕ AGREGAR AL CARRITO
  agregarProducto() {
    const { productoCodigo, ubicacion, cantidad } = this.form.value;

    const producto = this.productos.find((p) => p.codigo === productoCodigo);

    if (!producto || !this.productoEncontrado || !this.form.value.ubicacion){
      Swal.fire('Error', 'Selecciona un producto, ubicación y cantidad válidos', 'warning');
      return;
    };

    const subtotal = cantidad * producto.precio;

    this.carrito.push({
      productoCodigo,
      nombreProducto: producto.producto,
      ubicacion,
      cantidad,
      precioUnitario: producto.precio,
      subtotal,
    });

    this.form.patchValue({
      codigoBarra: '',
      cantidad: 1,
      almacenId: '',
    });
  }

  eliminarItem(index: number) {
    this.carrito.splice(index, 1);
  }

  get total() {
    return this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
  }

  // 🧾 CREAR PEDIDO
  guardarPedido() {
    if (this.carrito.length === 0) {
      Swal.fire('Error', 'Agrega productos al pedido', 'warning');
      return;
    }

    const pedido = {
      clienteId: this.form.value.clienteId || '9999999999999',
      impuesto: this.total * 0.15,
      subtotal: this.total - this.total * 0.15,
      descuento: 0,
      total: this.total,
      detalles: this.carrito,
    };

    this.pedidosService.crearPedido(pedido).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Pedido creado correctamente', 'success');

        this.carrito = [];

        this.form.patchValue({
          clienteId: '',
          productoCodigo: '',
          ubicacion: '',
          cantidad: 1,
        });

        this.productoEncontrado = false;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo crear el pedido', 'error');
      },
    });
  }

  // 🔄 ENVIAR A CAJA
  enviarACaja() {
    // aquí deberías ya tener pedido creado
    Swal.fire('Info', 'Se enviará a caja desde el detalle del pedido', 'info');
  }
}
