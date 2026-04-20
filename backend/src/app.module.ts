import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UsuariosModule } from './componentes/usuarios/usuarios.module';
import { AlmacenesModule } from './componentes/almacenes/almacenes.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProveedoresModule } from './componentes/proveedores/proveedores.module';
import { ProductosModule } from './componentes/productos/productos.module';
import { PerfilModule } from './componentes/perfil/perfil.module';
import { ArqueoModule } from './componentes/arqueo/arqueo.module';
import { CategoriaModule } from './componentes/categoria/categoria.module';
import { CierresModule } from './componentes/cierres/cierres.module';
import { ClientesModule } from './componentes/clientes/clientes.module';
import { InventarioModule } from './componentes/inventario/inventario.module';
import { UbicacionesModule } from './componentes/ubicaciones/ubicaciones.module';
import { AuthModule } from './componentes/auth/auth.module';

@Module({
  imports: [
    UsuariosModule,
    AlmacenesModule,
    ArqueoModule,
    CategoriaModule,
    CierresModule,
    ClientesModule,
    InventarioModule,
    PerfilModule,
    ProductosModule,
    ProveedoresModule,
    UbicacionesModule,
    PrismaModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
