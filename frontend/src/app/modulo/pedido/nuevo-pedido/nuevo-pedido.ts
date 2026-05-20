import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
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

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private pedidosService: PedidosService,
    private clientesService: ClientesService,
    private almacenesService: AlmacenesService,
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
  }

  cargarClientes() {
    this.clientesService.getClientes().subscribe({
      next: (data: any) => (this.clientes = data),
    });
  }

  buscarProductoPorCodigo() {
    this.ubicaciones = []; // limpiar ubicaciones al buscar nuevo producto
    const codigo = this.form.value.codigoBarra;

    const producto = this.productos.find((p) => String(p.codigo).trim() === String(codigo).trim());

    if (!producto) {
      Swal.fire('No encontrado', 'Producto no existe', 'warning');
      return;
    }

    this.form.patchValue({
      productoCodigo: producto.codigo,
    });

    this.cargarUbicaciones(producto.codigo);
  }

  cargarAlmacenes() {
    this.almacenesService.getAlmacenes().subscribe({
      next: (data: any) => {
        this.almacenes = [...data]; // 👈 fuerza referencia nueva
      },
    });
  }

  cargarUbicaciones(productoCodigo: string) {
    const almacenId = this.form.value.almacenId;

    if (!almacenId) {
      Swal.fire('Error', 'Selecciona un almacén primero', 'warning');
      return;
    }

    console.log('Producto:', productoCodigo, 'Almacén:', almacenId);

    this.productosService.getUbicaciones(productoCodigo, almacenId).subscribe((data: any) => {
      this.ubicaciones = data;

      console.log('Ubicaciones obtenidas:', data);
    });
  }

  // ➕ AGREGAR AL CARRITO
  agregarProducto() {
    const { productoCodigo, ubicacion, cantidad } = this.form.value;

    const producto = this.productos.find((p) => p.codigo === productoCodigo);

    if (!producto) return;

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
      productoCodigo: '',
      ubicacion: '',
      cantidad: 1,
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
      usuarioCodigo: 1, // temporal, luego vendrá del token
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
