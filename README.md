# Music Practice Tracker

> **⚠️ PORTFOLIO PROJECT - VIEWING ONLY**
>
> This project is published for **portfolio demonstration purposes only**.
> All rights reserved. See [LICENSE](./LICENSE) for usage restrictions.

## 📋 Project Overview

A comprehensive music practice tracking application built with modern web technologies and Domain-Driven Design (DDD) architecture. This project demonstrates advanced full-stack development skills including mobile app development, scalable backend API design, and admin dashboard creation.

### 🎯 Purpose

- **Portfolio demonstration** of enterprise-level technical capabilities
- **Educational reference** for DDD architecture patterns and clean code practices
- **Code quality showcase** with 95%+ test coverage and modern development workflows

### 🏗️ Technical Highlights

- **Domain-Driven Design**: Clean separation of domain, API, and repository layers
- **Dual API Architecture**: Separate user-scoped and admin APIs
- **Comprehensive Testing**: Unit, integration, and E2E tests with high coverage
- **Modern Tooling**: Bun runtime, TypeScript, ESLint with custom rules
- **Quality Gates**: Automated CI/CD with mandatory quality checks

## 🚀 Quick Start

Prerequisites: Node.js 22.19.0, Bun 1.2.21, Docker. For mobile: Android/iOS tooling, Expo CLI (optional: `npm i -g eas-cli`).

1) Setup: `make setup`
2) Start DB: `docker compose up -d`
3) Backend (terminal A): `cd packages/apps/backend && bun run start:dev`
4) Admin (terminal B): `cd packages/apps/admin && bun run start:dev`
5) Mobile (optional, terminal C): `cd packages/apps/mobile && bun run start:dev`

All‑in‑one checks: `bun run quality:check` (format, spell, lint, types).

## 🧭 Architecture Overview

- **DDD layering** with explicit domain, API, and repository boundaries.
- **Dual APIs**: user app API and admin API run as separate NestJS apps.
- **Data model**: Prisma with internal numeric IDs and UUID public IDs; commit hook validates schema conventions.

## 📄 License & Usage

**⚠️ IMPORTANT**: This project is **NOT** open source.

See [LICENSE](./LICENSE) for complete terms.

## Security

This is a portfolio project for demonstration purposes only.
For actual security concerns, please contact: <takuya.iwashiro@takudev.net>

## 💼 About the Developer

This project showcases my expertise in:

- **Architecture Design**: Domain-Driven Design, Clean Architecture, SOLID principles
- **Full-stack Development**: TypeScript, Node.js, React Native, Next.js
- **Backend Engineering**: NestJS, PostgreSQL, Prisma ORM, microservices patterns
- **Quality Engineering**: TDD/Behavior-Driven Development, 95%+ test coverage, custom ESLint rules
- **DevOps & Tooling**: CI/CD pipelines, automated quality gates, modern toolchain
- **Database Design**: Relational modeling, performance optimization, migration strategies

### 🛠️ Technology Stack

**Backend**: NestJS, TypeScript, PostgreSQL, Prisma, Bun runtime  
**Frontend**: Next.js (Admin), React Native/Expo (Mobile)  
**Testing**: Jest, custom test utilities, integration testing  
**Quality**: ESLint (custom rules), Prettier, comprehensive CI/CD  
**Infrastructure**: Docker, automated deployments, monitoring

## 📞 Contact

- 📧 Email: <takuya.iwashiro@takudev.net>
- 💻 GitHub: <https://github.com/t-i-0414>

---

Last updated: July 19, 2025
