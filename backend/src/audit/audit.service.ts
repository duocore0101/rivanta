import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async getLogs(hotelId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { hotelId },
      include: {
        user: { select: { firstName: true, lastName: true, role: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });
  }
}
