import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { FastifyPlugin } from "@/lib/fastify/fastify.constant.js";

const configurePrisma = async (fastify: FastifyInstance) => {
    if (!fastify.config.DATABASE_URL) {
        fastify.log.warn("DATABASE_URL not found. Prisma will not be initialized.");
        fastify.decorate("prisma", null as any) 
        return;
    }
    const prisma = new PrismaClient({
        datasourceUrl: fastify.config.DATABASE_URL,
    });
    try {
        await prisma.$connect();
        fastify.decorate("prisma", prisma);
        
        fastify.addHook("onClose", async (instance) => {
            // Only disconnect if it was actually created
            if (instance.prisma) await instance.prisma.$disconnect();
        });
    } catch (error) {
        fastify.log.error("Prisma connection failed. Continuing without database.");
        fastify.decorate("prisma", null as any);
    }
};

export default fp(configurePrisma, {
    name: FastifyPlugin.Prisma,
    dependencies: [FastifyPlugin.Env],
});
