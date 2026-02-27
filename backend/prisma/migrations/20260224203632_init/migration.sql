-- CreateTable
CREATE TABLE `contadores` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senhaHash` VARCHAR(191) NOT NULL,
    `crc` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `contadores_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessoes` (
    `id` VARCHAR(191) NOT NULL,
    `contadorId` VARCHAR(191) NOT NULL,
    `refreshToken` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessoes_refreshToken_key`(`refreshToken`),
    INDEX `sessoes_contadorId_idx`(`contadorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes` (
    `id` VARCHAR(191) NOT NULL,
    `nomeEmpresa` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `regimeTributario` ENUM('SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL', 'MEI') NOT NULL DEFAULT 'SIMPLES_NACIONAL',
    `statusContabil` ENUM('EM_DIA', 'PENDENTE', 'ATRASADO') NOT NULL DEFAULT 'EM_DIA',
    `nomeResponsavel` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NULL,
    `observacoes` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `clientes_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contador_clientes` (
    `id` VARCHAR(191) NOT NULL,
    `contadorId` VARCHAR(191) NOT NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `permissao` ENUM('VISUALIZAR', 'EDITAR', 'ADMIN') NOT NULL DEFAULT 'EDITAR',
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `contador_clientes_contadorId_idx`(`contadorId`),
    INDEX `contador_clientes_clienteId_idx`(`clienteId`),
    UNIQUE INDEX `contador_clientes_contadorId_clienteId_key`(`contadorId`, `clienteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lancamentos` (
    `id` VARCHAR(191) NOT NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `tipo` ENUM('RECEITA', 'DESPESA') NOT NULL,
    `categoria` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(15, 2) NOT NULL,
    `dataCompetencia` DATE NOT NULL,
    `dataVencimento` DATE NULL,
    `dataPagamento` DATE NULL,
    `status` ENUM('PAGO', 'PENDENTE', 'VENCIDO') NOT NULL DEFAULT 'PENDENTE',
    `notaFiscal` VARCHAR(191) NULL,
    `observacoes` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `lancamentos_clienteId_dataCompetencia_idx`(`clienteId`, `dataCompetencia`),
    INDEX `lancamentos_clienteId_tipo_dataCompetencia_idx`(`clienteId`, `tipo`, `dataCompetencia`),
    INDEX `lancamentos_clienteId_status_idx`(`clienteId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `obrigacoes_fiscais` (
    `id` VARCHAR(191) NOT NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `dataVencimento` DATE NOT NULL,
    `valor` DECIMAL(15, 2) NULL,
    `status` ENUM('PENDENTE', 'PAGO', 'ATRASADO', 'DISPENSADO') NOT NULL DEFAULT 'PENDENTE',
    `guiaGerada` BOOLEAN NOT NULL DEFAULT false,
    `arquivoUrl` VARCHAR(191) NULL,
    `observacoes` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `obrigacoes_fiscais_clienteId_dataVencimento_idx`(`clienteId`, `dataVencimento`),
    INDEX `obrigacoes_fiscais_clienteId_status_idx`(`clienteId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tarefas` (
    `id` VARCHAR(191) NOT NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `contadorId` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `status` ENUM('BACKLOG', 'EM_ANDAMENTO', 'REVISAO', 'CONCLUIDA') NOT NULL DEFAULT 'BACKLOG',
    `prioridade` ENUM('BAIXA', 'MEDIA', 'ALTA', 'URGENTE') NOT NULL DEFAULT 'MEDIA',
    `prazo` DATETIME(3) NULL,
    `tags` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `concluidoEm` DATETIME(3) NULL,

    INDEX `tarefas_clienteId_status_idx`(`clienteId`, `status`),
    INDEX `tarefas_contadorId_idx`(`contadorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documentos` (
    `id` VARCHAR(191) NOT NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `arquivoUrl` VARCHAR(191) NULL,
    `recebido` BOOLEAN NOT NULL DEFAULT false,
    `obrigatorio` BOOLEAN NOT NULL DEFAULT true,
    `mesRef` VARCHAR(191) NULL,
    `observacoes` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `documentos_clienteId_idx`(`clienteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessoes` ADD CONSTRAINT `sessoes_contadorId_fkey` FOREIGN KEY (`contadorId`) REFERENCES `contadores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contador_clientes` ADD CONSTRAINT `contador_clientes_contadorId_fkey` FOREIGN KEY (`contadorId`) REFERENCES `contadores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contador_clientes` ADD CONSTRAINT `contador_clientes_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lancamentos` ADD CONSTRAINT `lancamentos_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obrigacoes_fiscais` ADD CONSTRAINT `obrigacoes_fiscais_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tarefas` ADD CONSTRAINT `tarefas_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documentos` ADD CONSTRAINT `documentos_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
