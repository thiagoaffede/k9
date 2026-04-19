-- CREATE TABLES FOR K9 SYSTEM (SECCIÓN CANES U4)

-- CreateTable
CREATE TABLE "Dog" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "raza" TEXT,
    "sexo" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3),
    "color" TEXT,
    "senas_particulares" TEXT,
    "nro_chip" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "fecha_ingreso" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "origen" TEXT,
    "observaciones" TEXT,
    "foto_url" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaccine" (
    "id" SERIAL NOT NULL,
    "id_perro" INTEGER NOT NULL,
    "vacuna" TEXT NOT NULL,
    "fecha_aplicacion" TIMESTAMP(3) NOT NULL,
    "proxima_dosis" TIMESTAMP(3),
    "veterinario" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vaccine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VetControl" (
    "id" SERIAL NOT NULL,
    "id_perro" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT NOT NULL,
    "diagnostico" TEXT,
    "tratamiento" TEXT,
    "medicacion" TEXT,
    "dosis" TEXT,
    "veterinario" TEXT,
    "observaciones" TEXT,

    CONSTRAINT "VetControl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feeding" (
    "id" SERIAL NOT NULL,
    "id_perro" INTEGER NOT NULL,
    "tipo_alimento" TEXT NOT NULL,
    "marca" TEXT,
    "cantidad_diaria" TEXT,
    "horario" TEXT,
    "suplementos" TEXT,
    "fecha_inicio" TIMESTAMP(3),

    CONSTRAINT "Feeding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Training" (
    "id" SERIAL NOT NULL,
    "id_perro" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "nivel" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "instructor" TEXT,
    "evaluacion" TEXT,
    "observaciones" TEXT,

    CONSTRAINT "Training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "id_perro" INTEGER NOT NULL,
    "guia" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),
    "turno" TEXT,
    "observaciones" TEXT,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History" (
    "id" SERIAL NOT NULL,
    "id_perro" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo_evento" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "responsable" TEXT,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" SERIAL NOT NULL,
    "id_perro" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "gravedad" TEXT NOT NULL,
    "acciones_tomadas" TEXT,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'guia',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dog_nro_chip_key" ON "Dog"("nro_chip");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Vaccine" ADD CONSTRAINT "Vaccine_id_perro_fkey" FOREIGN KEY ("id_perro") REFERENCES "Dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VetControl" ADD CONSTRAINT "VetControl_id_perro_fkey" FOREIGN KEY ("id_perro") REFERENCES "Dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feeding" ADD CONSTRAINT "Feeding_id_perro_fkey" FOREIGN KEY ("id_perro") REFERENCES "Dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Training" ADD CONSTRAINT "Training_id_perro_fkey" FOREIGN KEY ("id_perro") REFERENCES "Dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_id_perro_fkey" FOREIGN KEY ("id_perro") REFERENCES "Dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_id_perro_fkey" FOREIGN KEY ("id_perro") REFERENCES "Dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_id_perro_fkey" FOREIGN KEY ("id_perro") REFERENCES "Dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
