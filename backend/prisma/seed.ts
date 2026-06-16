import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const contrasena = await bcrypt.hash('15203', 10);

  // PERFIL
  const perfil = await prisma.perfil.create({
    data: {
      dni: '0502200300737',
      nombre: 'Jorge Portillo',
      telefono: '95352881',
      cargo: 'Administrador',
      departamento: 'Sistemas',
      direccion: 'Calle Falsa 123',
      fechaIngreso: new Date('2026-06-15'),
      fechaUltimoAscenso: new Date('2026-06-15'),
    },
  });

  // USUARIO
  await prisma.usuarios.create({
    data: {
      rol: 'admin',
      contrasena: contrasena,
      perfil: {
        connect: {
          id: perfil.id,
        },
      },
    },
  });

  console.log('Seed completado');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
